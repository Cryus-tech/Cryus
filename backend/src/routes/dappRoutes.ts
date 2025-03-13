import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authenticate';
import {
  generateDapp,
  getDapps,
  getDapp,
  updateDapp,
  deleteDapp,
} from '../controllers/dappController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Generate a new dapp
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Dapp name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('blockchain').notEmpty().withMessage('Blockchain is required'),
    body('contractAddress').optional(),
    body('features').isArray().withMessage('Features must be an array'),
    body('uiFramework').notEmpty().withMessage('UI framework is required'),
  ],
  generateDapp
);

// Get all dapps for the authenticated user
router.get('/', getDapps);

// Get a specific dapp
router.get('/:id', getDapp);

// Update a dapp
router.patch('/:id', updateDapp);

// Delete a dapp
router.delete('/:id', deleteDapp);

export default router; 