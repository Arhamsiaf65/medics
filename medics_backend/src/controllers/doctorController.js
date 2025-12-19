const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Get all doctors with optional filters
 * GET /api/doctors?specialty=&search=
 */
const getAllDoctors = async (req, res, next) => {
    try {
        const { specialty, search } = req.query;

        const where = {};

        // Filter by specialty
        if (specialty) {
            where.specialty = {
                equals: specialty,
                mode: 'insensitive',
            };
        }

        // Search by name
        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        const doctors = await prisma.doctor.findMany({
            where,
            orderBy: { rating: 'desc' },
            select: {
                id: true,
                name: true,
                specialty: true,
                rating: true,
                distance: true,
                imageUrl: true,
                consultationFee: true,
                isTopDoctor: true,
                adminFee: true,
                discount: true,
                adminFee: true,
                discount: true,
                defaultTimeSlots: true,
                userId: true
            },
        });

        res.json({
            success: true,
            data: doctors,
            message: 'Doctors retrieved successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get top doctors
 * GET /api/doctors/top
 */
const getTopDoctors = async (req, res, next) => {
    try {
        const doctors = await prisma.doctor.findMany({
            where: { isTopDoctor: true },
            orderBy: { rating: 'desc' },
            select: {
                id: true,
                name: true,
                specialty: true,
                rating: true,
                distance: true,
                imageUrl: true,
                consultationFee: true,
                isTopDoctor: true,
                adminFee: true,
                discount: true,
                defaultTimeSlots: true,
            },
        });

        res.json({
            success: true,
            data: doctors,
            message: 'Top doctors retrieved successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get doctor by ID
 * GET /api/doctors/:id
 */
const getDoctorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: {
                schedules: {
                    where: {
                        date: { gte: new Date().toISOString().split('T')[0] },
                    },
                    orderBy: { date: 'asc' },
                },
            },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found.',
                code: 'NOT_FOUND',
            });
        }

        res.json({
            success: true,
            data: doctor,
            message: 'Doctor retrieved successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get doctor's available schedule dates
 * GET /api/doctors/:id/schedule
 */
const getDoctorSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify doctor exists
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                defaultTimeSlots: true,
                consultationFee: true,
                adminFee: true,
                discount: true
            },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found.',
                code: 'NOT_FOUND',
            });
        }

        const today = new Date();
        const dates = [];

        // Generate next 7 days
        for (let i = 0; i < 7; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            const dateStr = nextDate.toISOString().split('T')[0];
            dates.push(dateStr);
        }

        // Fetch existing specific schedules for these dates
        const existingSchedules = await prisma.doctorSchedule.findMany({
            where: {
                doctorId: id,
                date: { in: dates },
            },
        });

        const existingMap = new Map();
        existingSchedules.forEach(s => existingMap.set(s.date, s.timeSlots));

        // Use default slots if available, otherwise generic defaults
        const defaultSlots = doctor.defaultTimeSlots && doctor.defaultTimeSlots.length > 0
            ? doctor.defaultTimeSlots
            : ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

        // Construct final schedules (merge defaults with overrides)
        const finalSchedules = dates.map(date => ({
            date,
            timeSlots: existingMap.has(date) ? existingMap.get(date) : defaultSlots
        }));

        res.json({
            success: true,
            data: {
                doctorId: id,
                doctorName: doctor.name,
                availableDates: dates,
                schedules: finalSchedules,
                paymentDetails: {
                    consultationFee: doctor.consultationFee,
                    adminFee: doctor.adminFee,
                    discount: doctor.discount
                }
            },
            message: 'Schedule retrieved successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get time slots for a specific date
 * GET /api/doctors/:id/slots/:date
 */
const getDoctorSlots = async (req, res, next) => {
    try {
        const { id, date } = req.params;

        // Verify doctor exists and get defaults
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            select: { id: true, name: true, defaultTimeSlots: true },
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found.',
                code: 'NOT_FOUND',
            });
        }

        // Get specific schedule for the date if it exists
        const schedule = await prisma.doctorSchedule.findUnique({
            where: {
                doctorId_date: {
                    doctorId: id,
                    date,
                },
            },
        });

        // Determine base slots: valid schedule > doctor default > hardcoded default
        let timeSlots = [];
        if (schedule) {
            timeSlots = schedule.timeSlots;
        } else {
            timeSlots = doctor.defaultTimeSlots && doctor.defaultTimeSlots.length > 0
                ? doctor.defaultTimeSlots
                : ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
        }

        // Get booked appointments for this doctor on this date
        const bookedAppointments = await prisma.appointment.findMany({
            where: {
                doctorId: id,
                date,
                status: { notIn: ['CANCELLED'] },
            },
            select: { time: true },
        });

        const bookedTimes = bookedAppointments.map((a) => a.time);

        // Filter out booked slots
        const availableSlots = timeSlots.filter(
            (slot) => !bookedTimes.includes(slot)
        );

        res.json({
            success: true,
            data: {
                doctorId: id,
                date,
                timeSlots: timeSlots, // Total slots
                bookedSlots: bookedTimes,
                availableSlots,
            },
            message: 'Time slots retrieved successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all specialties
 * GET /api/doctors/specialties
 */
const getSpecialties = async (req, res, next) => {
    try {
        const specialties = await prisma.doctor.findMany({
            select: { specialty: true },
            distinct: ['specialty'],
            orderBy: { specialty: 'asc' },
        });

        const specialtyList = specialties.map((s) => s.specialty);

        res.json({
            success: true,
            data: specialtyList,
            message: 'Specialties retrieved successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new doctor
 * POST /api/doctors
 */
const createDoctor = async (req, res, next) => {
    try {
        const { name, specialty, imageUrl, about, consultationFee, isTopDoctor, email, password, adminFee, discount, defaultTimeSlots } = req.body;

        // VALIDATION
        if (!name || !specialty || consultationFee === undefined || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "Name, specialty, consultation fee, email, and password are required.",
                code: "MISSING_FIELDS",
            });
        }

        const fee = Number(consultationFee);
        if (Number.isNaN(fee)) {
            return res.status(400).json({
                success: false,
                error: "Consultation fee must be a number.",
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists.',
                code: 'USER_EXISTS',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Use transaction to create User and Doctor
        const doctor = await prisma.$transaction(async (tx) => {
            // Create User with DOCTOR role
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'DOCTOR',
                    avatarUrl: imageUrl
                }
            });

            // BUILD DATA OBJECT SAFELY
            const data = {
                name,
                specialty,
                about,
                consultationFee: fee,
                adminFee: adminFee ? Number(adminFee) : 1.0,
                discount: discount ? Number(discount) : 0.0,
                defaultTimeSlots: defaultTimeSlots || ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
                isTopDoctor: isTopDoctor || false,
                distance: "1.2 km",
                userId: user.id
            };

            // Only add imageUrl if provided
            if (imageUrl) data.imageUrl = imageUrl;

            const newDoctor = await tx.doctor.create({ data });
            return newDoctor;
        });

        res.status(201).json({
            success: true,
            data: doctor,
            message: "Doctor created successfully.",
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Update a doctor
 * PUT /api/doctors/:id
 */
const updateDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingDoctor = await prisma.doctor.findUnique({ where: { id } });
        if (!existingDoctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found.',
                code: 'NOT_FOUND',
            });
        }

        if (updateData.consultationFee) {
            updateData.consultationFee = parseFloat(updateData.consultationFee);
        }

        const doctor = await prisma.doctor.update({
            where: { id },
            data: updateData,
        });

        res.json({
            success: true,
            data: doctor,
            message: 'Doctor updated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a doctor
 * DELETE /api/doctors/:id
 */
const deleteDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingDoctor = await prisma.doctor.findUnique({ where: { id } });
        if (!existingDoctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found.',
                code: 'NOT_FOUND',
            });
        }

        await prisma.doctor.delete({
            where: { id },
        });

        res.json({
            success: true,
            data: null,
            message: 'Doctor deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check if user has access to modify doctor data
 */
const checkAccess = async (user, doctorId) => {
    if (user.role === 'ADMIN' || user.role === 'ROOT') return true;

    // If user is DOCTOR, check if they own the profile
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { userId: true }
    });

    if (doctor && doctor.userId === user.id) return true;

    return false;
};

/**
 * Update default slots for a doctor
 * PUT /api/doctors/:id/schedule/default
 */
const updateDefaultSlots = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { defaultTimeSlots } = req.body;

        // AUTH CHECK
        const canAccess = await checkAccess(req.user, id);
        if (!canAccess) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized access to this doctor profile.',
            });
        }

        const doctor = await prisma.doctor.update({
            where: { id },
            data: { defaultTimeSlots },
        });

        res.json({
            success: true,
            data: doctor,
            message: 'Default slots updated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update/Create schedule for a specific date
 * POST /api/doctors/:id/schedule/date
 */
const updateDateSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date, timeSlots } = req.body; // date: "2025-02-10", timeSlots: []

        // AUTH CHECK
        const canAccess = await checkAccess(req.user, id);
        if (!canAccess) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized access to this doctor profile.',
            });
        }

        const schedule = await prisma.doctorSchedule.upsert({
            where: {
                doctorId_date: {
                    doctorId: id,
                    date: date
                }
            },
            update: { timeSlots },
            create: {
                doctorId: id,
                date: date,
                timeSlots
            }
        });

        res.json({
            success: true,
            data: schedule,
            message: 'Schedule for date updated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove schedule override for a date (revert to default)
 * DELETE /api/doctors/:id/schedule/date
 */
const deleteDateSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.body;

        // AUTH CHECK
        const canAccess = await checkAccess(req.user, id);
        if (!canAccess) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized access to this doctor profile.',
            });
        }

        await prisma.doctorSchedule.deleteMany({
            where: {
                doctorId: id,
                date: date
            }
        });

        res.json({
            success: true,
            data: null,
            message: 'Schedule override removed. Reverted to default.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllDoctors,
    getTopDoctors,
    getDoctorById,
    getDoctorSchedule,
    getDoctorSlots,
    getSpecialties,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    updateDefaultSlots,
    updateDateSchedule,
    deleteDateSchedule
};
