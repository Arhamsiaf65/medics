const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and ROOT role
router.use(authenticate, authorize('ROOT'));

router.get('/admins', adminController.getAllAdmins);
router.post('/create-admin', adminController.createAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;
