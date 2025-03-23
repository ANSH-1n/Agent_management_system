import express from 'express';
import { connect, getStatus, disconnect, sendData } from '../controllers/whatsappController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.use(protect);


router.post('/connect', connect);


router.get('/status', getStatus);


router.post('/disconnect', disconnect);


router.post('/send', sendData);

export default router;
