import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  getAgentItems,
} from '../controllers/agent.controller.js';

const router = express.Router();

router.use(protect);
router.use(admin);


router.route('/')
  .get(getAgents)
  .post(createAgent);

router.route('/:id')
  .get(getAgentById)
  .put(updateAgent)
  .delete(deleteAgent);

router.get('/:id/items', getAgentItems);

export default router;
