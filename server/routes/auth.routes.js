
import express from 'express';
import { login, getMe, registerAdmin } from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);

router.post('/register', registerAdmin);  


export default router;
