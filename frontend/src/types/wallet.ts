/**
 * 钱包类型
 */
export type WalletType = 
  | 'metamask'  // 以太坊系列
  | 'phantom'   // Solana
  | 'solflare'  // Solana
  | 'walletconnect'; // 多链支持

/**
 * 链类型
 */
export type ChainType = 
  | 'ethereum'   // 以太坊主网
  | 'goerli'     // 以太坊测试网
  | 'sepolia'    // 以太坊测试网
  | 'polygon'    // Polygon主网
  | 'mumbai'     // Polygon测试网
  | 'bsc'        // 币安智能链主网
  | 'bsc-testnet'// 币安智能链测试网
  | 'avalanche'  // Avalanche主网
  | 'fuji'       // Avalanche测试网
  | 'solana'     // Solana主网
  | 'solana-devnet' // Solana开发网
  | 'solana-testnet'; // Solana测试网

/**
 * 钱包连接请求
 */
export interface WalletConnectionRequest {
  /**
   * 钱包类型
   */
  walletType: WalletType;
  
  /**
   * 目标链
   */
  chain: ChainType;
  
  /**
   * 可选的附加选项
   */
  options?: {
    /**
     * 是否静默连接（如果可能）
     */
    silent?: boolean;
    
    /**
     * 是否强制断开现有连接
     */
    forceDisconnect?: boolean;
  };
}

/**
 * 钱包连接响应
 */
export interface WalletConnectionResponse {
  /**
   * 连接状态
   */
  connected: boolean;
  
  /**
   * 钱包地址（如果连接成功）
   */
  address?: string;
  
  /**
   * 连接的链（如果连接成功）
   */
  chain?: ChainType;
  
  /**
   * 错误信息（如果连接失败）
   */
  error?: string;
}

/**
 * 钱包签名请求
 */
export interface WalletSignRequest {
  /**
   * 签名地址
   */
  address: string;
  
  /**
   * 待签名消息
   */
  message: string;
  
  /**
   * 消息编码（默认为UTF-8）
   */
  encoding?: 'utf8' | 'hex';
}

/**
 * 钱包签名响应
 */
export interface WalletSignResponse {
  /**
   * 签名结果
   */
  signature?: string;
  
  /**
   * 错误信息（如果签名失败）
   */
  error?: string;
}

/**
 * 交易请求
 */
export interface TransactionRequest {
  /**
   * 交易类型
   */
  type: 'transfer' | 'swap' | 'approve' | 'stake' | 'unstake' | 'bridge';
  
  /**
   * 发送方地址
   */
  from: string;
  
  /**
   * 接收方地址
   */
  to: string;
  
  /**
   * 资产符号
   */
  asset: string;
  
  /**
   * 资产数量
   */
  amount: string;
  
  /**
   * 链类型
   */
  chain: ChainType;
  
  /**
   * 目标链（如果是跨链操作）
   */
  targetChain?: ChainType;
  
  /**
   * 附加数据
   */
  data?: any;
}

/**
 * 交易响应
 */
export interface TransactionResponse {
  /**
   * 交易是否成功
   */
  success: boolean;
  
  /**
   * 交易哈希
   */
  hash?: string;
  
  /**
   * 交易ID（如果是跨链操作）
   */
  bridgeId?: string;
  
  /**
   * 交易状态
   */
  status?: 'pending' | 'confirmed' | 'failed';
  
  /**
   * 错误信息（如果交易失败）
   */
  error?: string;
}

/**
 * 钱包事件类型
 */
export enum WalletEventType {
  CONNECTED = 'wallet:connected',
  DISCONNECTED = 'wallet:disconnected',
  ACCOUNT_CHANGED = 'wallet:accountChanged',
  CHAIN_CHANGED = 'wallet:chainChanged',
  TRANSACTION_STATUS = 'wallet:transactionStatus'
}

/**
 * 钱包事件数据
 */
export interface WalletEventData {
  /**
   * 钱包地址
   */
  address?: string;
  
  /**
   * 链类型
   */
  chain?: ChainType;
  
  /**
   * 钱包类型
   */
  walletType?: WalletType;
  
  /**
   * 交易哈希（适用于交易状态事件）
   */
  transactionHash?: string;
  
  /**
   * 交易状态（适用于交易状态事件）
   */
  transactionStatus?: 'pending' | 'confirmed' | 'failed';
  
  /**
   * 其他数据
   */
  [key: string]: any;
} 