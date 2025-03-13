import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authenticate';
import {
  generateWhitepaper,
  getWhitepapers,
  getWhitepaper,
  updateWhitepaper,
  deleteWhitepaper,
} from '../controllers/whitepaperController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Generate a new whitepaper
router.post(
  '/',
  [
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('projectDescription').notEmpty().withMessage('Project description is required'),
    body('industry').notEmpty().withMessage('Industry is required'),
    body('targetAudience').notEmpty().withMessage('Target audience is required'),
    body('problemStatement').notEmpty().withMessage('Problem statement is required'),
    body('solutionDescription').notEmpty().withMessage('Solution description is required'),
  ],
  generateWhitepaper
);

// Get all whitepapers for the authenticated user
router.get('/', getWhitepapers);

// Get a specific whitepaper
router.get('/:id', getWhitepaper);

// Update a whitepaper
router.patch('/:id', updateWhitepaper);

// Delete a whitepaper
router.delete('/:id', deleteWhitepaper);

export default router; 