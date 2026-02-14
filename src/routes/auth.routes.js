import express from 'express';
import {
  register,
  login,
  refreshToken,
  me,
  updateMe,
  logout,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, me);
router.patch('/me', protect, updateMe);

export default router;
