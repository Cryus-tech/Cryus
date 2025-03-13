import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import whitepaperRoutes from './whitepaperRoutes';
import tokenomicsRoutes from './tokenomicsRoutes';
import contractRoutes from './contractRoutes';
import dappRoutes from './dappRoutes';
import blockchainRoutes from './blockchainRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/whitepaper', whitepaperRoutes);
router.use('/tokenomics', tokenomicsRoutes);
router.use('/contracts', contractRoutes);
router.use('/dapps', dappRoutes);
router.use('/blockchain', blockchainRoutes);

export default router; 