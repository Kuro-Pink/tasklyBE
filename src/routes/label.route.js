import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createLabel, getLabels } from '../controllers/label.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', createLabel);
router.get('/:projectId', getLabels);

export default router;
