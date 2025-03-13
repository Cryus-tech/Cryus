import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/authenticate';
import {
  createTokenMint,
  createTokenAccount,
  mintTokens,
  transferTokens,
  burnTokens,
  createNFT,
  transferNFT,
  updateNFTMetadata,
  getBalance,
  getTokenAccountInfo,
  getMintInfo,
  getNFTInfo,
  getTransactionHistory,
  getTransactionDetail,
} from '../controllers/blockchainController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Token-related routes

// Create token mint account
router.post(
  '/token/mint',
  [
    body('decimals').optional().isInt({ min: 0, max: 9 }).withMessage('Decimals must be between 0-9'),
  ],
  createTokenMint
);

// Create token account
router.post(
  '/token/account',
  [
    body('mintAddress').notEmpty().withMessage('Mint address is required'),
  ],
  createTokenAccount
);

// Mint tokens
router.post(
  '/token/mint-tokens',
  [
    body('mintAddress').notEmpty().withMessage('Mint address is required'),
    body('destinationAddress').notEmpty().withMessage('Destination address is required'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
  ],
  mintTokens
);

// Transfer tokens
router.post(
  '/token/transfer',
  [
    body('sourceAddress').notEmpty().withMessage('Source address is required'),
    body('destinationAddress').notEmpty().withMessage('Destination address is required'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
  ],
  transferTokens
);

// Burn tokens
router.post(
  '/token/burn',
  [
    body('tokenAccountAddress').notEmpty().withMessage('Token account address is required'),
    body('mintAddress').notEmpty().withMessage('Mint address is required'),
    body('amount').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
  ],
  burnTokens
);

// NFT-related routes

// Create NFT
router.post(
  '/nft/create',
  [
    body('name').notEmpty().withMessage('NFT name is required'),
    body('symbol').notEmpty().withMessage('NFT symbol is required'),
    body('uri').notEmpty().withMessage('Metadata URI is required'),
    body('royaltyPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Royalty percentage must be between 0-100'),
    body('isMutable').optional().isBoolean().withMessage('isMutable must be a boolean value'),
  ],
  createNFT
);

// Transfer NFT
router.post(
  '/nft/transfer',
  [
    body('nftAddress').notEmpty().withMessage('NFT address is required'),
    body('newOwnerAddress').notEmpty().withMessage('New owner address is required'),
  ],
  transferNFT
);

// Update NFT metadata
router.post(
  '/nft/update-metadata',
  [
    body('nftAddress').notEmpty().withMessage('NFT address is required'),
    body('name').optional(),
    body('symbol').optional(),
    body('uri').optional(),
  ],
  updateNFTMetadata
);

// Transaction history and details routes

// Get transaction history
router.get('/transactions', getTransactionHistory);

// Get transaction details
router.get('/transactions/:id', getTransactionDetail);

// Query-related routes

// Get account balance
router.get('/balance/:address', getBalance);

// Get token account info
router.get('/token/account/:address', getTokenAccountInfo);

// Get token mint info
router.get('/token/mint/:address', getMintInfo);

// Get NFT info
router.get('/nft/:address', getNFTInfo);

/**
 * @route GET /api/blockchain/wallet-balance
 * @desc 获取钱包余额（跨链）
 * @access Public
 */
router.get(
  '/wallet-balance',
  [
    query('address').notEmpty().withMessage('钱包地址是必需的'),
    query('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    query('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.getWalletBalance
);

/**
 * @route GET /api/blockchain/tokens
 * @desc 获取代币余额（跨链）
 * @access Public
 */
router.get(
  '/tokens',
  [
    query('address').notEmpty().withMessage('钱包地址是必需的'),
    query('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    query('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.getTokenBalances
);

/**
 * @route GET /api/blockchain/nfts
 * @desc 获取NFT（跨链）
 * @access Public
 */
router.get(
  '/nfts',
  [
    query('address').notEmpty().withMessage('钱包地址是必需的'),
    query('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    query('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.getNFTs
);

/**
 * @route GET /api/blockchain/transactions
 * @desc 获取交易历史（跨链）
 * @access Public
 */
router.get(
  '/transactions',
  [
    query('address').notEmpty().withMessage('钱包地址是必需的'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('限制必须是1-50之间的整数'),
    query('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    query('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.getTransactionHistory
);

/**
 * @route POST /api/blockchain/send-asset
 * @desc 发送资产（SOL或ETH）
 * @access Private
 */
router.post(
  '/send-asset',
  [
    body('privateKey').notEmpty().withMessage('私钥是必需的'),
    body('to').notEmpty().withMessage('接收方地址是必需的'),
    body('amount').notEmpty().isNumeric().withMessage('金额必须是数字'),
    body('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    body('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.sendAsset
);

/**
 * @route POST /api/blockchain/send-token
 * @desc 发送代币
 * @access Private
 */
router.post(
  '/send-token',
  [
    body('privateKey').notEmpty().withMessage('私钥是必需的'),
    body('tokenAddress').notEmpty().withMessage('代币地址是必需的'),
    body('to').notEmpty().withMessage('接收方地址是必需的'),
    body('amount').notEmpty().isNumeric().withMessage('金额必须是数字'),
    body('decimals').optional().isInt().withMessage('精度必须是整数'),
    body('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    body('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.sendToken
);

/**
 * @route POST /api/blockchain/deploy-token
 * @desc 部署代币合约
 * @access Private
 */
router.post(
  '/deploy-token',
  [
    body('privateKey').notEmpty().withMessage('私钥是必需的'),
    body('name').notEmpty().withMessage('代币名称是必需的'),
    body('symbol').notEmpty().withMessage('代币符号是必需的'),
    body('initialSupply').notEmpty().isNumeric().withMessage('初始供应量必须是数字'),
    body('decimals').optional().isInt({ min: 0, max: 18 }).withMessage('精度必须是0-18之间的整数'),
    body('maxSupply').optional().isNumeric().withMessage('最大供应量必须是数字'),
    body('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    body('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.deployTokenContract
);

/**
 * @route POST /api/blockchain/deploy-nft
 * @desc 部署NFT合约
 * @access Private
 */
router.post(
  '/deploy-nft',
  [
    body('privateKey').notEmpty().withMessage('私钥是必需的'),
    body('name').notEmpty().withMessage('集合名称是必需的'),
    body('symbol').notEmpty().withMessage('集合符号是必需的'),
    body('baseURI').optional().isString().withMessage('基础URI必须是字符串'),
    body('maxSupply').optional().isNumeric().withMessage('最大供应量必须是数字'),
    body('royaltyFee').optional().isInt({ min: 0, max: 10000 }).withMessage('版税必须是0-10000之间的整数（表示0-100%）'),
    body('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    body('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.deployNFTContract
);

/**
 * @route POST /api/blockchain/mint-nft
 * @desc 铸造NFT
 * @access Private
 */
router.post(
  '/mint-nft',
  [
    body('privateKey').notEmpty().withMessage('私钥是必需的'),
    body('contractAddress').notEmpty().withMessage('合约地址是必需的'),
    body('to').notEmpty().withMessage('接收方地址是必需的'),
    body('metadataURI').notEmpty().withMessage('元数据URI是必需的'),
    body('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    body('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.mintNFT
);

/**
 * @route GET /api/blockchain/network-status
 * @desc 获取网络状态（跨链）
 * @access Public
 */
router.get(
  '/network-status',
  [
    query('blockchain').optional().isIn(['solana', 'ethereum']).withMessage('区块链类型必须是solana或ethereum'),
    query('network').optional().isString().withMessage('网络参数必须是字符串'),
    validateRequest,
  ],
  blockchainController.getNetworkStatus
);

/**
 * @route POST /api/blockchain/cross-chain-transfer
 * @desc 执行跨链转账
 * @access Private
 */
router.post(
  '/cross-chain-transfer',
  [
    body('fromPrivateKey').notEmpty().withMessage('发送方私钥是必需的'),
    body('toAddress').notEmpty().withMessage('接收方地址是必需的'),
    body('amount').notEmpty().isNumeric().withMessage('金额必须是数字'),
    body('sourceChain').notEmpty().isIn(['solana', 'ethereum']).withMessage('源区块链类型必须是solana或ethereum'),
    body('targetChain').notEmpty().isIn(['solana', 'ethereum']).withMessage('目标区块链类型必须是solana或ethereum'),
    body('bridgeType').optional().isIn(['wormhole', 'synapse', 'celer']).withMessage('桥接类型必须是wormhole、synapse或celer'),
    validateRequest,
  ],
  blockchainController.executeCrossChainTransfer
);

export default router; 