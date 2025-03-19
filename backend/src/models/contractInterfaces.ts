/**
 * Contract interfaces for token generation platform
 */

/**
 * Blockchain types supported by the system
 */
export enum BlockchainType {
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  BSC = 'bsc',
  POLYGON = 'polygon',
  AVALANCHE = 'avalanche',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism'
}

/**
 * Token features that can be enabled
 */
export enum TokenFeature {
  MINTABLE = 'mintable',
  BURNABLE = 'burnable',
  PAUSABLE = 'pausable',
  PERMIT = 'permit',
  VOTES = 'votes',
  SNAPSHOT = 'snapshot',
  FLASH_MINTING = 'flashMinting',
  ANTI_BOT = 'antiBot',
  LIQUIDITY_GENERATOR = 'liquidityGenerator',
  TAX = 'tax',
  MAX_TRANSACTION = 'maxTransaction',
  MAX_WALLET = 'maxWallet',
  BLACKLIST = 'blacklist'
}

/**
 * Token standard enumeration
 */
export enum TokenStandard {
  ERC20 = 'ERC20',        // Ethereum ERC20
  ERC721 = 'ERC721',      // Ethereum ERC721
  ERC1155 = 'ERC1155',    // Ethereum ERC1155
  SPL = 'SPL',            // Solana SPL token
  BEP20 = 'BEP20'         // BNB Chain BEP20
}

/**
 * Token configuration parameters
 */
export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string | number;
  maxSupply?: string | number;
  features?: TokenFeature[];
  owner?: string;
  metadata?: TokenMetadata;
}

/**
 * Additional token metadata
 */
export interface TokenMetadata {
  description?: string;
  website?: string;
  logoUrl?: string;
  socials?: {
    twitter?: string;
    telegram?: string;
    github?: string;
  };
  taxConfig?: {
    buyTax?: number;
    sellTax?: number;
    transferTax?: number;
    marketingTaxShare?: number;
    liquidityTaxShare?: number;
    developmentTaxShare?: number;
    marketingWallet?: string;
    developmentWallet?: string;
    liquidityWallet?: string;
  };
  antiBot?: {
    enabled: boolean;
    maxTransactionAmount?: string;
    maxWalletAmount?: string;
    tradingActivationDelay?: number;
  };
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  chainId: number;
  name: string;
  currencySymbol: string;
  blockExplorerUrl: string;
}

/**
 * Transaction status information
 */
export interface TransactionStatus {
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'ERROR';
  confirmations?: number;
  blockNumber?: number | null;
  gasUsed?: string;
  timestamp: number;
  error?: string | null;
}

/**
 * Result of token deployment
 */
export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  txHash?: string;
  blockNumber?: number;
  timestamp: number;
  chainType: BlockchainType;
  explorerUrl?: string;
  error?: string;
}

/**
 * Fee estimate for token deployment
 */
export interface FeeEstimate {
  gasEstimate: string;
  gasPrice: string;
  fee: {
    amount: string;
    currency: string;
  };
  feeUSD: string;
} 