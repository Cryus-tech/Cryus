import { Router } from 'express';
import { getProfile, updateProfile, deleteAccount } from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.patch('/profile', updateProfile);

// Delete user account
router.delete('/account', deleteAccount);

export default router; 