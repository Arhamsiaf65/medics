const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

const { authenticate } = require('../middleware/auth');

// All doctor routes are public (GET)
router.get('/', doctorController.getAllDoctors);
router.get('/top', doctorController.getTopDoctors);
router.get('/specialties', doctorController.getSpecialties);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/schedule', doctorController.getDoctorSchedule);
router.get('/:id/slots/:date', doctorController.getDoctorSlots);
router.post('/create', doctorController.createDoctor);

// Admin routes (Protected)
router.post('/', authenticate, doctorController.createDoctor);
router.put('/:id', authenticate, doctorController.updateDoctor);
router.delete('/:id', authenticate, doctorController.deleteDoctor);

// Schedule Routes (Doctor/Admin)
router.put('/:id/schedule/default', authenticate, doctorController.updateDefaultSlots);
router.post('/:id/schedule/date', authenticate, doctorController.updateDateSchedule);
router.delete('/:id/schedule/date', authenticate, doctorController.deleteDateSchedule);

module.exports = router;
