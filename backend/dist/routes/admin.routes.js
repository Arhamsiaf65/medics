import Router from 'express';
import { addDoctor, getAllDoctors, updateDoctor, deleteDoctor } from '../controllers/admin/manage_doctors.admin.controller.js';
import { addAdmin, getAllAdmins, updateAdmin, deleteAdmin } from '../controllers/admin/manage_admins.admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { isAdmin, isRootAdmin } from '../middlewares/role.middleware.js';
const router = Router();
// Doctor Management (Accessible by any Admin)
router.post('/add-doctor', protect, isAdmin, addDoctor);
router.get('/doctors', protect, isAdmin, getAllDoctors);
router.put('/doctors/:id', protect, isAdmin, updateDoctor);
router.delete('/doctors/:id', protect, isAdmin, deleteDoctor);
// Admin Management (Creation and Deletion strictly by Root Admin, reading and updating by Admin if needed)
router.post('/admins', protect, isRootAdmin, addAdmin);
router.get('/admins', protect, isRootAdmin, getAllAdmins);
router.put('/admins/:id', protect, isRootAdmin, updateAdmin);
router.delete('/admins/:id', protect, isRootAdmin, deleteAdmin);
export default router;
//# sourceMappingURL=admin.routes.js.map