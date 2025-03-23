import express from 'express';
const router = express.Router();

import {
  uploadList,
  getListRecords,
  getListRecordById,
  getListItems,
  getDistributionSummary,
  getUploadHistory,
  downloadList
} from '../controllers/list.controller.js';

import { protect, admin } from '../middleware/authMiddleware.js';

router.use(protect);
router.use(admin);

router.get('/uploads', getUploadHistory);
router.get('/download/:id', downloadList);

router.route('/')
  .get(getListRecords);

router.post('/upload', uploadList);

router.route('/:id')
  .get(getListRecordById);

router.get('/:id/items', getListItems);
router.get('/:id/summary', getDistributionSummary);

export default router;