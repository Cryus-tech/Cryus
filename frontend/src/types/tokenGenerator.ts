/**
 * 代币生成器相关类型定义
 */

/**
 * 代币特性枚举
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
 * 区块链类型枚举
 */
export enum BlockchainType {
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  BSC = 'bsc',
  POLYGON = 'polygon',
  AVALANCHE = 'avalanche',
  ARBITRUM = 'arbitrum'
}

/**
 * 代币配置接口
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
 * 代币元数据接口
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
 * 聊天消息接口
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * AI分析结果接口
 */
export interface AIAnalysisResult {
  tokenConfig: TokenConfig;
  projectSummary: string;
  suggestedFeatures: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
  };
  aiConfidence: number;
}

/**
 * 部署结果接口
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
 * 费用估算接口
 */
export interface FeeEstimate {
  fee: string;
  feeUSD: string;
  currency: string;
  gasLimit?: string;
  gasPrice?: string;
} 