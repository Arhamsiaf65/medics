import { Router } from 'express';
import { getDoctorProfile, updateDoctorProfile } from '../controllers/doctor.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { isDoctor } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/profile', protect, isDoctor, getDoctorProfile);
router.put('/profile', protect, isDoctor, updateDoctorProfile);

export default router;
