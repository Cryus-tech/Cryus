import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authenticate';
import {
  generateContract,
  getContracts,
  getContract,
  updateContract,
  deleteContract,
  analyzeContract,
  optimizeContract,
  generateTests,
  implementContract
} from '../controllers/contractController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Generate a new smart contract
router.post(
  '/',
  [
    body('contractType').notEmpty().withMessage('Contract type is required'),
    body('blockchain').notEmpty().withMessage('Blockchain is required'),
    body('tokenName').notEmpty().when('contractType', {
      is: (type: string) => ['ERC20', 'ERC721', 'SPL Token', 'NFT'].includes(type),
      then: body('tokenName').notEmpty(),
    }),
    body('tokenSymbol').notEmpty().when('contractType', {
      is: (type: string) => ['ERC20', 'ERC721', 'SPL Token', 'NFT'].includes(type),
      then: body('tokenSymbol').notEmpty(),
    }),
    body('totalSupply').isNumeric().optional({ nullable: true }),
    body('features').isArray().notEmpty().withMessage('Features are required'),
    body('securityLevel').isIn(['standard', 'enhanced', 'maximum']).optional(),
  ],
  generateContract
);

// Get all contracts for the authenticated user
router.get('/', getContracts);

// Get a specific contract
router.get('/:id', getContract);

// Update a contract
router.patch('/:id', updateContract);

// Delete a contract
router.delete('/:id', deleteContract);

// Analyze a contract for security issues
router.post('/:id/analyze', analyzeContract);

// Optimize contract code
router.post('/:id/optimize', [
  body('optimization').isIn(['gas', 'performance', 'readability']).optional(),
], optimizeContract);

// Generate tests for a contract
router.post('/:id/tests', [
  body('testingFramework').optional(),
], generateTests);

// Generate an implementation of the contract
router.post('/:contractId/implement', implementContract);

export default router; 