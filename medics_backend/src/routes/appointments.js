const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');

// Protected Routes
router.post('/book', authenticate, appointmentController.bookAppointment);
router.get('/my', authenticate, appointmentController.getMyAppointments);
router.get('/doctor/:doctorId', authenticate, appointmentController.getDoctorAppointments);

module.exports = router;
