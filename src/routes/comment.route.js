import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createComment, getComments, deleteComment } from '../controllers/comment.controller.js';

const router = express.Router();

router.post('/', protect, createComment);
router.get('/:issueId', protect, getComments);
router.delete('/:id', protect, deleteComment);

export default router;
