import { Router } from 'express';
import {
    getAvailableSlots,
    getMySlots,
    bookAppointment,
    cancelAppointment,
    getMyAppointments,
    getDoctorAppointments,
    doctorUpdateStatus,
    adminGetAllAppointments,
    adminUpdateStatus
} from '../controllers/appointments.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { isDoctor, isAdmin } from '../middlewares/role.middleware.js';

const router = Router();

// ─── Any logged-in user ──────────────────────────────────
router.get('/available-slots', protect, getAvailableSlots);
router.post('/book', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.patch('/cancel/:id', protect, cancelAppointment);

// ─── Doctor only (middleware enforced) ───────────────────
router.get('/doctor/my-slots', protect, isDoctor, getMySlots);
router.get('/doctor/appointments', protect, isDoctor, getDoctorAppointments);
router.patch('/doctor/:id/status', protect, isDoctor, doctorUpdateStatus);

// ─── Admin only (middleware enforced) ────────────────────
router.get('/admin/appointments', protect, isAdmin, adminGetAllAppointments);
router.patch('/admin/:id/status', protect, isAdmin, adminUpdateStatus);

export default router;
