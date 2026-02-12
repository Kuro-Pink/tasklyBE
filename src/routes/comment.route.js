import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCommentSchema } from '../validators/comment.validator.js';
import { createComment, getComments, deleteComment } from '../controllers/comment.controller.js';

const router = express.Router();

router.post('/', validate(createCommentSchema), protect, createComment);
router.get('/:issueId', protect, getComments);
router.delete('/:id', protect, deleteComment);

export default router;
