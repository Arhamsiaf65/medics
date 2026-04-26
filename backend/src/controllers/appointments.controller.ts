import type { Request, Response } from 'express';
import { Appointment } from '../models/appointment.model.js';
import { Doctor } from '../models/doctor.model.js';
import mongoose from 'mongoose';
import { getRedis } from '../config/redis.js';
import type { Redis } from "ioredis";
import { getEmailQueue } from '../utils/queue.js';
import type { Queue } from "bullmq";
import { log } from 'node:console';

const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getUTCDay()] || 'monday';
};

/**
 * Given a broad time block (e.g. "09:00" to "13:00") and a duration in minutes,
 * generates individual bookable slot strings like "09:00 - 09:30", "09:30 - 10:00", etc.
 */
const generateSlotsFromBlock = (blockStart: string, blockEnd: string, durationMinutes: number): string[] => {
    const slots: string[] = [];
    const startParts = blockStart.split(':');
    const endParts = blockEnd.split(':');

    let curH = parseInt(startParts[0] || '0', 10);
    let curM = parseInt(startParts[1] || '0', 10);
    const endTotal = parseInt(endParts[0] || '0', 10) * 60 + parseInt(endParts[1] || '0', 10);

    while (true) {
        let nextM = curM + durationMinutes;
        let nextH = curH;
        if (nextM >= 60) {
            nextH += Math.floor(nextM / 60);
            nextM = nextM % 60;
        }
        const nextTotal = nextH * 60 + nextM;

        if (nextTotal > endTotal) break;

        const start = `${curH.toString().padStart(2, '0')}:${curM.toString().padStart(2, '0')}`;
        const end = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;
        slots.push(`${start} - ${end}`);

        curH = nextH;
        curM = nextM;
    }

    return slots;
};

/**
 * Returns all bookable slots for a doctor on a given date,
 * auto-generated from workingHours blocks + slotDuration.
 */
const getDoctorAllSlots = (doctor: any, date: string): string[] => {
    const dayOfWeek = getDayName(date);
    const workingHoursObj = doctor.workingHours as any;
    const blocks = workingHoursObj && workingHoursObj[dayOfWeek] ? workingHoursObj[dayOfWeek] : [];
    const duration = doctor.slotDuration || 30;

    const slots: string[] = [];
    for (const block of blocks) {
        if (block.start && block.end) {
            slots.push(...generateSlotsFromBlock(block.start, block.end, duration));
        }
    }
    return slots;
};

/**
 * Returns booked timeSlot strings for a doctor on a given date.
 */
const getBookedSlots = async (doctorId: string, date: string): Promise<string[]> => {
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['cancelled', 'rejected'] }
    });

    return bookedAppointments.map(appt => appt.timeSlot);
};

// ─── Route Handlers ─────────────────────────────────────────────────

/** GET /available-slots?date=YYYY-MM-DD&doctorId=optional — Any logged-in user */
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, doctorId } = req.query as { date?: string; doctorId?: string };

        if (!date) {
            res.status(400).json({ message: 'Date is required (YYYY-MM-DD)' });
            return;
        }

        const filter: any = {};
        if (doctorId) {
            if (mongoose.Types.ObjectId.isValid(doctorId)) {
                filter._id = doctorId;
            } else {
                res.status(400).json({ message: 'Invalid doctor ID' });
                return;
            }
        }

        const doctors = await Doctor.find(filter).populate('user', 'name');
        if (!doctors || doctors.length === 0) {
            res.json([]);
            return;
        }

        const result = [];
        for (const doctor of doctors) {
            const allSlots = getDoctorAllSlots(doctor, date);
            const booked = await getBookedSlots(doctor._id.toString(), date);
            const availableSlots = allSlots.filter(slot => !booked.includes(slot));

            result.push({
                doctorId: doctor._id,
                doctorName: (doctor.user as any)?.name,
                specialization: doctor.specialization,
                slotDuration: doctor.slotDuration,
                totalSlots: allSlots.length,
                bookedCount: booked.length,
                availableSlots
            });
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error calculating slots' });
    }
};

/** GET /doctor/my-slots?date=YYYY-MM-DD — Doctor only (middleware enforced) */
export const getMySlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.query as { date?: string };

        if (!date) {
            res.status(400).json({ message: 'Date is required (YYYY-MM-DD)' });
            return;
        }

        const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', 'name');
        if (!doctor) {
            res.status(404).json({ message: 'Doctor profile not found' });
            return;
        }

        const allSlots = getDoctorAllSlots(doctor, date);
        const booked = await getBookedSlots(doctor._id.toString(), date);
        const availableSlots = allSlots.filter(slot => !booked.includes(slot));

        res.json({
            doctorId: doctor._id,
            doctorName: (doctor.user as any)?.name,
            slotDuration: doctor.slotDuration,
            allSlots,
            bookedSlots: booked,
            availableSlots
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching your slots' });
    }
};

/** POST /book — User books an appointment */
export const bookAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { doctorId, date, timeSlot } = req.body;
        const redis: Redis = getRedis();
        if (!doctorId || !date || !timeSlot) {
            res.status(400).json({ message: 'doctorId, date, and timeSlot are required' });
            return;
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            res.status(404).json({ message: 'Doctor not found' });
            return;
        }

        // Validate slot exists in the auto-generated schedule
        const allSlots = getDoctorAllSlots(doctor, date);
        if (!allSlots.includes(timeSlot)) {
            res.status(400).json({ message: 'Invalid time slot for the given date' });
            return;
        }

        // Check conflict
        const booked = await getBookedSlots(doctorId, date);
        if (booked.includes(timeSlot)) {
            res.status(409).json({ message: 'This time slot is already booked' });
            return;
        }

        const appointment = await Appointment.create({
            patient: req.user.id,
            doctor: doctorId,
            date: new Date(`${date}T00:00:00Z`),
            timeSlot,
            status: 'approved',
            paymentStatus: 'pending'
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error booking appointment' });
    }
};

/** PATCH /cancel/:id — User cancels their own appointment */
export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        if (appointment.patient?.toString() !== req.user.id) {
            res.status(403).json({ message: 'You can only cancel your own appointments' });
            return;
        }

        appointment.status = 'cancelled';
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error cancelling appointment' });
    }
};

/** GET /my — User sees their own appointments */
export const getMyAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointments = await Appointment.find({ patient: req.user.id })
            .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
            .sort({ date: -1 });

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/** GET /doctor/appointments — Doctor sees their appointments (middleware enforced) */
export const getDoctorAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctor = await Doctor.findOne({ user: req.user.id });
        if (!doctor) {
            res.status(404).json({ message: 'Doctor profile not found' });
            return;
        }

        const appointments = await Appointment.find({ doctor: doctor._id })
            .populate('patient', 'name email')
            .sort({ date: -1 });

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/** PATCH /doctor/:id/status — Doctor updates status (middleware enforced) */
export const doctorUpdateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const validStatuses = ['approved', 'rejected', 'completed'];

        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
            return;
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        appointment.status = status;
        if (status === 'approved') {
            appointment.approvedBy = req.user.id;
        }
        await appointment.save();
        const emailQueue: Queue = getEmailQueue();
        await emailQueue.add(`appointment-update`, {
            appointmentId: appointment._id,
            status: appointment.status,
            email: appointment.patient?.email,
        });

        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/** GET /admin/appointments — Admin sees all appointments (middleware enforced) */
export const adminGetAllAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointments = await Appointment.find()
            .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
            .populate('patient', 'name email')
            .sort({ date: -1 });

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/** PATCH /admin/:id/status — Admin updates any appointment status (middleware enforced) */
export const adminUpdateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const validStatuses = ['approved', 'rejected', 'cancelled', 'completed'];

        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
            return;
        }

        const appointment = await Appointment.findById(req.params.id)
            .populate("patient", "email");
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        appointment.status = status;
        if (status === 'approved') {
            appointment.approvedBy = req.user.id;
        }
        await appointment.save();
        const emailQueue: Queue = getEmailQueue();
        console.log("email", appointment);
        await emailQueue.add(`appointment-update`, {
            appointmentId: appointment._id,
            status: appointment.status,
            email: appointment.patient?.email,
        });

        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
