import { Router } from 'express';
import { getChatHistory } from '../controllers/chat.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
const router = Router();
router.get('/:user1/:user2', protect, getChatHistory);
export default router;
//# sourceMappingURL=chat.routes.js.map