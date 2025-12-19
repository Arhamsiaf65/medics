const prisma = require('../config/database');

/**
 * Book an appointment
 * POST /api/appointments/book
 */
const bookAppointment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { doctorId, date, time, reason } = req.body;

        // 1. Validation
        if (!doctorId || !date || !time) {
            return res.status(400).json({
                success: false,
                error: 'Doctor, date, and time are required.',
                code: 'MISSING_FIELDS'
            });
        }

        // Validate date is not in the past (basic check)
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
            return res.status(400).json({
                success: false,
                error: 'Cannot book appointments in the past.',
                code: 'INVALID_DATE'
            });
        }

        // 2. Check Doctor Exists & Get Fee and Default Slots
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: { id: true, consultationFee: true, name: true, defaultTimeSlots: true }
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found.',
                code: 'NOT_FOUND'
            });
        }

        // 3. Check Availability (Prevent Double Booking)
        // Check if there is already an active appointment for this doctor at this date/time
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                date,
                time,
                status: { not: 'CANCELLED' }
            }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                error: 'This time slot is already booked.',
                code: 'SLOT_BOOKED'
            });
        }

        // 4. Create Appointment
        const appointment = await prisma.appointment.create({
            data: {
                userId,
                doctorId,
                date,
                time,
                reason,
                totalAmount: doctor.consultationFee,
                status: 'PENDING',
                paymentStatus: 'PENDING'
            },
            include: {
                doctor: {
                    select: { name: true, specialty: true, imageUrl: true, distance: true, rating: true }
                }
            }
        });

        // 5. Update Doctor Schedule (Remove the booked slot)
        // Fetch existing schedule for this date
        const existingSchedule = await prisma.doctorSchedule.findUnique({
            where: {
                doctorId_date: {
                    doctorId: doctorId,
                    date: date
                }
            }
        });

        let updatedSlots = [];

        if (existingSchedule) {
            // Remove the booked time from existing slots
            updatedSlots = existingSchedule.timeSlots.filter(t => t !== time);
        } else {
            // Use default slots minus the booked one
            const defaultSlots = doctor.defaultTimeSlots && doctor.defaultTimeSlots.length > 0
                ? doctor.defaultTimeSlots
                : ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
            updatedSlots = defaultSlots.filter(t => t !== time);
        }

        // Upsert the schedule
        await prisma.doctorSchedule.upsert({
            where: {
                doctorId_date: {
                    doctorId: doctorId,
                    date: date
                }
            },
            update: { timeSlots: updatedSlots },
            create: {
                doctorId: doctorId,
                date: date,
                timeSlots: updatedSlots
            }
        });

        res.status(201).json({
            success: true,
            data: appointment,
            message: 'Appointment booked successfully.'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get user's appointments
 * GET /api/appointments/my
 */
const getMyAppointments = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const appointments = await prisma.appointment.findMany({
            where: { userId },
            include: {
                doctor: {
                    select: { name: true, specialty: true, imageUrl: true, distance: true, rating: true, consultationFee: true }
                }
            },
            orderBy: [
                { date: 'desc' },
                { time: 'desc' }
            ]
        });

        res.json({
            success: true,
            data: appointments,
            message: 'Appointments retrieved successfully.'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get appointments for a specific doctor
 * GET /api/appointments/doctor/:doctorId
 */
const getDoctorAppointments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { doctorId } = req.params;

        // AUTH CHECK: Ensure the requesting user owns this doctor profile
        // We could also allow ADMINs
        if (req.user.role !== 'ROOT' && req.user.role !== 'ADMIN') {
            const doctor = await prisma.doctor.findUnique({
                where: { id: doctorId },
                select: { userId: true }
            });

            if (!doctor || doctor.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized access to these appointments.',
                });
            }
        }

        const appointments = await prisma.appointment.findMany({
            where: { doctorId },
            include: {
                user: {
                    select: { name: true, email: true, phone: true, avatarUrl: true }
                }
            },
            orderBy: [
                { date: 'desc' },
                { time: 'desc' }
            ]
        });

        res.json({
            success: true,
            data: appointments,
            message: 'Doctor appointments retrieved successfully.'
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments
};
