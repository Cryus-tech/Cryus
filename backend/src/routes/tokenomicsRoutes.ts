import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authenticate';
import {
  generateTokenomics,
  getTokenomicsModels,
  getTokenomicsModel,
  updateTokenomicsModel,
  deleteTokenomicsModel,
} from '../controllers/tokenomicsController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Generate a new tokenomics model
router.post(
  '/',
  [
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('projectDescription').notEmpty().withMessage('Project description is required'),
    body('tokenName').notEmpty().withMessage('Token name is required'),
    body('tokenSymbol').notEmpty().withMessage('Token symbol is required'),
    body('totalSupply').isNumeric().withMessage('Total supply must be a number'),
    body('useCase').notEmpty().withMessage('Use case is required'),
    body('monetizationStrategy').notEmpty().withMessage('Monetization strategy is required'),
  ],
  generateTokenomics
);

// Get all tokenomics models for the authenticated user
router.get('/', getTokenomicsModels);

// Get a specific tokenomics model
router.get('/:id', getTokenomicsModel);

// Update a tokenomics model
router.patch('/:id', updateTokenomicsModel);

// Delete a tokenomics model
router.delete('/:id', deleteTokenomicsModel);

export default router; 