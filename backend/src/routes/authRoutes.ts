import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, refreshToken } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Register route
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
  ],
  register
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Logout route
router.post('/logout', authenticate, logout);

// Refresh token route
router.post('/refresh-token', refreshToken);

export default router; 