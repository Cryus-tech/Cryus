/**
 * 钱包余额信息接口
 */
export interface WalletBalance {
  // Solana余额
  sol?: number;
  // 以太坊余额
  eth?: number;
  // 美元价值
  usd_value: number;
  // 代币列表
  tokens: TokenBalance[];
}

/**
 * 代币余额信息接口
 */
export interface TokenBalance {
  // 代币地址
  mint: string;
  // 代币符号
  symbol: string;
  // 代币名称
  name: string;
  // 余额数量
  amount: number;
  // 代币精度
  decimals: number;
  // 美元价值（可选）
  usd_value?: number;
}

/**
 * NFT信息接口
 */
export interface NFT {
  // NFT地址
  mint: string;
  // NFT名称
  name: string;
  // NFT符号
  symbol: string;
  // NFT元数据URI
  uri: string;
  // 拥有者地址
  owner: string;
  // 图片URL（可选）
  image_url?: string;
  // 描述（可选）
  description?: string;
  // 属性（可选）
  attributes?: NFTAttribute[];
  // 集合信息（可选）
  collection?: {
    name: string;
    family: string;
  };
  // 创作者信息（可选）
  creators?: {
    address: string;
    share: number;
  }[];
}

/**
 * NFT属性接口
 */
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

/**
 * 交易类型枚举
 */
export enum TransactionType {
  SOL_TRANSFER = 'sol_transfer',
  TOKEN_TRANSFER = 'token_transfer',
  NFT_TRANSFER = 'nft_transfer',
  ETH_TRANSFER = 'eth_transfer',
  TOKEN_MINT = 'token_mint',
  TOKEN_BURN = 'token_burn',
  NFT_MINT = 'nft_mint',
  SWAP = 'swap',
  OTHER = 'other'
}

/**
 * 交易状态枚举
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

/**
 * 交易信息接口
 */
export interface Transaction {
  // 交易ID
  id: string;
  // 交易哈希
  hash: string;
  // 交易类型
  type: TransactionType;
  // 交易状态
  status: TransactionStatus;
  // 交易金额
  amount: number;
  // 交易费用
  fee: number;
  // 发送方地址
  from: string;
  // 接收方地址
  to: string;
  // 交易时间戳
  timestamp: string;
  // 确认数
  confirmations: number;
  // 区块号（可选）
  block_number?: number;
  // 代币地址（可选，如果是代币交易）
  token_address?: string;
  // 详情（可选）
  details?: any;
}

/**
 * 网络状态接口
 */
export interface NetworkStatus {
  // 网络名称
  name: string;
  // 当前区块
  current_block: number;
  // 当前费率
  fee_rate?: number; // SOL
  gas_price?: number; // ETH (in Gwei)
  // 网络是否健康
  is_healthy: boolean;
}

/**
 * 代币价格接口
 */
export interface TokenPrice {
  // 代币地址
  address: string;
  // 代币符号
  symbol: string;
  // 美元价格
  usd_price: number;
  // 24小时变化百分比
  change_24h: number;
  // 24小时交易量
  volume_24h: number;
  // 市值
  market_cap: number;
}

/**
 * 交易策略接口
 */
export interface TradingStrategy {
  // 策略ID
  id: string;
  // 策略名称
  name: string;
  // 策略描述
  description: string;
  // 策略状态
  status: 'active' | 'paused' | 'stopped';
  // 创建时间
  created_at: string;
  // 更新时间
  updated_at: string;
  // 交易参数
  parameters: {
    asset: string;
    entry_conditions: any[];
    exit_conditions: any[];
    risk_management: {
      stop_loss: number;
      take_profit: number;
      max_position_size: number;
    };
    timeframe: string;
    [key: string]: any;
  };
  // 执行统计
  statistics?: {
    total_trades: number;
    win_rate: number;
    profit_loss: number;
    max_drawdown: number;
    [key: string]: any;
  };
}

/**
 * 策略执行结果接口
 */
export interface StrategyExecutionResult {
  // 执行ID
  execution_id: string;
  // 策略ID
  strategy_id: string;
  // 状态
  status: 'success' | 'failed' | 'partial';
  // 执行细节
  details: {
    asset: string;
    entry_price?: number;
    exit_price?: number;
    position_size: number;
    profit_loss?: number;
    reason: string;
    timestamp: string;
    transaction_id?: string;
  };
  // 错误信息（如果有）
  error?: string;
}

/**
 * 回测结果接口
 */
export interface BacktestResult {
  // 回测ID
  id: string;
  // 策略ID
  strategy_id: string;
  // 资产
  asset: string;
  // 开始日期
  start_date: string;
  // 结束日期
  end_date: string;
  // 初始资本
  initial_capital: number;
  // 最终资本
  final_capital: number;
  // 净利润
  net_profit: number;
  // 收益率
  return_percentage: number;
  // 总交易次数
  total_trades: number;
  // 盈利交易次数
  winning_trades: number;
  // 亏损交易次数
  losing_trades: number;
  // 胜率
  win_rate: number;
  // 最大回撤
  max_drawdown: number;
  // 最大回撤百分比
  max_drawdown_percentage: number;
  // 夏普比率
  sharpe_ratio: number;
  // 交易列表
  trades: {
    entry_date: string;
    exit_date: string;
    entry_price: number;
    exit_price: number;
    position_size: number;
    profit_loss: number;
    return_percentage: number;
    trade_duration: number;
  }[];
  // 每日绩效
  daily_performance: {
    date: string;
    equity: number;
    returns: number;
    drawdown: number;
  }[];
  // 创建时间
  created_at: string;
}

/**
 * 风险分析接口
 */
export interface RiskAnalysis {
  // 分析ID
  id: string;
  // 策略ID或资产
  target_id: string;
  // 分析类型
  type: 'strategy' | 'asset' | 'portfolio';
  // 波动率
  volatility: number;
  // 最大回撤
  max_drawdown: number;
  // 夏普比率
  sharpe_ratio: number;
  // 索提诺比率
  sortino_ratio: number;
  // 风险调整后的收益
  risk_adjusted_return: number;
  // 风险评级（1-5，5最高风险）
  risk_rating: number;
  // 分析详情
  details: {
    historical_var: number;
    expected_shortfall: number;
    correlation_matrix?: Record<string, Record<string, number>>;
    stress_test_results?: {
      scenario: string;
      impact: number;
    }[];
    [key: string]: any;
  };
  // 分析时间
  analyzed_at: string;
}

/**
 * 桥接类型枚举
 */
export type BridgeType = 'wormhole' | 'synapse' | 'celer';

/**
 * 桥接状态枚举
 */
export enum BridgeStatus {
  PENDING = 'pending',                      // 等待开始
  SOURCE_CHAIN_PROCESSING = 'source_chain_processing', // 源链处理中
  SOURCE_CHAIN_CONFIRMED = 'source_chain_confirmed',   // 源链确认
  BRIDGE_PROCESSING = 'bridge_processing',  // 桥接处理中
  TARGET_CHAIN_PROCESSING = 'target_chain_processing', // 目标链处理中
  COMPLETED = 'completed',                  // 完成
  FAILED = 'failed'                         // 失败
}

/**
 * 桥接状态历史记录接口
 */
export interface BridgeStatusHistory {
  status: BridgeStatus;
  timestamp: string;
  message: string;
}

/**
 * 桥接交易接口
 */
export interface BridgeTransaction {
  id: string;                        // 交易ID
  sourceChain: string;               // 源区块链
  targetChain: string;               // 目标区块链
  fromAddress: string;               // 发送方地址
  toAddress: string;                 // 接收方地址
  amount: number;                    // 金额
  asset: string;                     // 资产符号（如ETH、USDC等）
  fee: number;                       // 总费用
  sourceTxHash: string;              // 源链交易哈希
  targetTxHash: string;              // 目标链交易哈希
  status: BridgeStatus;              // 状态
  bridgeType: BridgeType;            // 桥接类型
  createdAt: string;                 // 创建时间
  updatedAt: string;                 // 更新时间
  estimatedCompletionTime: string;   // 估计完成时间
  statusHistory: BridgeStatusHistory[]; // 状态历史
}

/**
 * 跨链交易统计接口
 */
export interface CrossChainStats {
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  totalVolume: Record<string, number>; // 按资产分类的总交易量
  averageCompletionTime: number; // 平均完成时间（秒）
  popularPaths: Array<{
    sourceChain: string;
    targetChain: string;
    count: number;
  }>;
}

/**
 * 钱包连接请求接口
 */
export interface WalletConnectionRequest {
  walletType: 'metamask' | 'phantom' | 'solflare' | 'walletconnect';
  chain: string;
  callback?: string; // 回调URL
}

/**
 * 钱包连接响应接口
 */
export interface WalletConnectionResponse {
  connected: boolean;
  address?: string;
  chain?: string;
  error?: string;
}

/**
 * 钱包签名请求接口
 */
export interface WalletSignRequest {
  address: string;
  message: string;
  chain: string;
}

/**
 * 钱包签名响应接口
 */
export interface WalletSignResponse {
  signature?: string;
  error?: string;
}

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
 * 资产信息
 */
export interface AssetInfo {
  // 资产地址(对原生代币可以为null或特殊值)
  address: string | null;
  // 小数位数
  decimals: number;
  // 名称
  name: string;
  // 符号
  symbol: string;
  // 图标URL
  logoUrl?: string;
  // 是否为原生资产
  isNative: boolean;
  // 最小单位到单位转换率
  conversionRate?: number;
}

/**
 * 资产映射
 */
export type AssetMapping = {
  [chain in ChainType]?: AssetInfo;
};

/**
 * 代币余额
 */
export interface TokenBalance {
  // 代币符号
  symbol: string;
  // 代币名称
  name: string;
  // 代币地址
  address: string | null;
  // 代币数量(格式化)
  formatted: string;
  // 代币数量(原始)
  raw: string;
  // 小数位数
  decimals: number;
  // 美元价值
  usdValue?: string;
  // 图标URL
  logoUrl?: string;
}

/**
 * 钱包余额
 */
export interface WalletBalance {
  // 钱包地址
  address: string;
  // 链类型
  chain: ChainType;
  // 原生代币余额
  native: {
    // 原生代币符号
    symbol: string;
    // 余额(格式化)
    formatted: string;
    // 余额(原始)
    raw: string;
    // 美元价值
    usdValue?: string;
  };
  // 代币余额列表
  tokens: TokenBalance[];
  // 总美元价值
  totalUsdValue?: string;
  // 最后更新时间
  lastUpdated: number;
}

/**
 * 交易
 */
export interface Transaction {
  // 交易哈希
  hash: string;
  // 链类型
  chain: ChainType;
  // 发送方地址
  from: string;
  // 接收方地址
  to: string;
  // 交易金额(原始)
  value: string;
  // 交易费用(原始)
  fee?: string;
  // 交易成功状态
  success?: boolean;
  // 交易状态
  status: 'pending' | 'confirmed' | 'failed';
  // 区块号
  blockNumber?: number;
  // 区块哈希
  blockHash?: string;
  // 交易时间戳
  timestamp: number;
  // 原生代币符号
  nativeSymbol: string;
  // 交易类型
  type?: string;
  // 交易备注
  memo?: string;
  // 确认数
  confirmations?: number;
  // 交易输入数据
  input?: string;
  // 合约地址(如果适用)
  contractAddress?: string;
  // 交易方法ID和名称(如果是合约调用)
  method?: {
    id: string;
    name: string;
  };
  // 交易事件
  events?: any[];
}

/**
 * 桥接类型
 */
export type BridgeType = 'wormhole' | 'synapse' | 'celer';

/**
 * 桥接状态
 */
export enum BridgeStatus {
  PENDING = 'pending',
  SOURCE_CHAIN_PROCESSING = 'source_chain_processing',
  SOURCE_CHAIN_CONFIRMED = 'source_chain_confirmed',
  BRIDGE_PROCESSING = 'bridge_processing',
  TARGET_CHAIN_PROCESSING = 'target_chain_processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * 桥接状态历史
 */
export interface BridgeStatusHistory {
  // 状态
  status: BridgeStatus;
  // 时间戳
  timestamp: number;
  // 状态消息
  message?: string;
}

/**
 * 桥接交易
 */
export interface BridgeTransaction {
  // 交易ID
  id: string;
  // 源链
  sourceChain: ChainType;
  // 目标链
  targetChain: ChainType;
  // 源地址
  sourceAddress: string;
  // 目标地址
  targetAddress: string;
  // 资产金额
  amount: string;
  // 资产符号
  asset: string;
  // 源链资产地址
  sourceAssetAddress?: string;
  // 目标链资产地址
  targetAssetAddress?: string;
  // 源链交易哈希
  sourceTxHash?: string;
  // 目标链交易哈希
  targetTxHash?: string;
  // 桥接费用
  fee?: {
    // 源链费用
    source?: string;
    // 目标链费用
    target?: string;
    // 桥接服务费用
    bridge?: string;
    // 总费用(USD)
    totalUsd?: string;
  };
  // 桥接状态
  status: BridgeStatus;
  // 桥接类型
  bridgeType: BridgeType;
  // 创建时间
  createdAt: number;
  // 更新时间
  updatedAt: number;
  // 完成时间
  completedAt?: number;
  // 估计完成时间
  estimatedCompletionTime?: number;
  // 状态历史
  statusHistory: BridgeStatusHistory[];
  // 用户ID(可选)
  userId?: string;
  // 附加数据
  additionalData?: any;
}

/**
 * 跨链统计
 */
export interface CrossChainStats {
  // 总交易数
  totalTransactions: number;
  // 完成交易数
  completedTransactions: number;
  // 失败交易数
  failedTransactions: number;
  // 资产交易量
  volumeByAsset: {
    [asset: string]: {
      // 交易量
      volume: string;
      // 美元价值
      usdValue: string;
    };
  };
  // 平均完成时间(毫秒)
  averageCompletionTime: number;
  // 常用路径
  popularPaths: {
    [path: string]: number;
  };
}

/**
 * 钱包连接请求
 */
export interface WalletConnectionRequest {
  // 钱包类型
  walletType: string;
  // 链类型
  chain: ChainType;
  // 地址(可选)
  address?: string;
  // 选项
  options?: {
    [key: string]: any;
  };
}

/**
 * 钱包连接响应
 */
export interface WalletConnectionResponse {
  // 是否已连接
  connected: boolean;
  // 地址
  address?: string;
  // 链类型
  chain?: ChainType;
  // 错误信息
  error?: string;
  // 附加数据
  data?: any;
}

/**
 * 钱包签名请求
 */
export interface WalletSignRequest {
  // 签名地址
  address: string;
  // 消息
  message: string;
  // 签名选项
  options?: {
    // 编码
    encoding?: string;
    // 其他选项
    [key: string]: any;
  };
}

/**
 * 钱包签名响应
 */
export interface WalletSignResponse {
  // 签名
  signature?: string;
  // 错误信息
  error?: string;
  // 公钥
  publicKey?: string;
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  // 错误代码
  code: string;
  // 错误消息
  message: string;
  // 错误详情
  details?: any;
  // HTTP状态码
  statusCode?: number;
}

/**
 * 成功响应
 */
export interface SuccessResponse<T> {
  // 数据
  data: T;
  // 消息
  message?: string;
  // 元数据
  meta?: {
    // 总数
    total?: number;
    // 页码
    page?: number;
    // 每页数量
    perPage?: number;
    // 其他元数据
    [key: string]: any;
  };
}

/**
 * 价格数据
 */
export interface PriceData {
  // 代币符号
  symbol: string;
  // 代币地址(如适用)
  address?: string;
  // 价格(USD)
  priceUsd: string;
  // 24小时价格变化(%)
  change24h?: string;
  // 市值
  marketCap?: string;
  // 24小时交易量
  volume24h?: string;
  // 上次更新时间
  lastUpdated: number;
}

/**
 * 代币元数据
 */
export interface TokenMetadata {
  // 代币符号
  symbol: string;
  // 代币名称
  name: string;
  // 代币地址
  address: string;
  // 代币小数位数
  decimals: number;
  // 代币图标URL
  logoUrl?: string;
  // 代币描述
  description?: string;
  // 代币网站
  website?: string;
  // Social media links
  social?: {
    // Twitter
    twitter?: string;
    // Telegram
    telegram?: string;
    // Other social media
    [key: string]: string | undefined;
  };
  // 代币合约代码链接
  codeUrl?: string;
  // 代币审计报告链接
  auditUrl?: string;
  // 代币白皮书链接
  whitePaperUrl?: string;
  // 代币发行日期
  launchDate?: string;
  // 代币总供应量
  totalSupply?: string;
  // 代币流通供应量
  circulatingSupply?: string;
  // 获取代币的交易所
  exchanges?: string[];
}

/**
 * 用户账户
 */
export interface UserAccount {
  // 用户ID
  id: string;
  // 电子邮件
  email: string;
  // 用户名
  username: string;
  // 是否已验证
  verified: boolean;
  // 创建时间
  createdAt: number;
  // 上次登录时间
  lastLoginAt?: number;
  // 角色
  role: 'user' | 'admin' | 'developer';
  // API密钥
  apiKeys?: {
    // 密钥ID
    id: string;
    // 密钥名称
    name: string;
    // 密钥前缀
    prefix: string;
    // 创建时间
    createdAt: number;
    // 上次使用时间
    lastUsedAt?: number;
    // 是否已禁用
    disabled: boolean;
  }[];
  // 账户设置
  settings?: {
    // 通知设置
    notifications?: {
      // 电子邮件通知
      email: boolean;
      // 浏览器通知
      browser: boolean;
      // 其他通知设置
      [key: string]: any;
    };
    // 其他设置
    [key: string]: any;
  };
}

/**
 * 开发者账户
 */
export interface DeveloperAccount extends UserAccount {
  // 订阅计划
  plan: 'free' | 'pro' | 'enterprise';
  // 使用统计
  usage: {
    // API调用
    apiCalls: {
      // 今日调用次数
      today: number;
      // 本月调用次数
      thisMonth: number;
      // 总调用次数
      total: number;
      // 上次调用时间
      lastCall?: number;
    };
    // 合约部署
    deployments: {
      // 总部署次数
      total: number;
      // 上次部署时间
      lastDeployment?: number;
      // 按链统计部署
      byChain: {
        [chain: string]: number;
      };
    };
  };
  // 计费信息
  billing?: {
    // 订阅ID
    subscriptionId?: string;
    // 当前周期开始
    currentPeriodStart?: number;
    // 当前周期结束
    currentPeriodEnd?: number;
    // 是否已取消
    canceled?: boolean;
    // 支付方式最后四位
    lastFour?: string;
  };
}

/**
 * 智能合约类型
 */
export type ContractType = 'erc20' | 'erc721' | 'erc1155' | 'spl-token' | 'spl-nft' | 'custom';

/**
 * 智能合约安全级别
 */
export type SecurityLevel = 'standard' | 'enhanced' | 'maximum';

/**
 * 智能合约生成请求
 */
export interface ContractGenerationRequest {
  // 合约类型
  type: ContractType;
  // 目标链
  chain: ChainType;
  // 合约名称
  name: string;
  // 合约符号
  symbol: string;
  // 小数位数(如适用)
  decimals?: number;
  // 初始供应量(如适用)
  initialSupply?: string;
  // 最大供应量(如适用)
  maxSupply?: string;
  // 是否可铸造
  mintable?: boolean;
  // 是否可燃烧
  burnable?: boolean;
  // 是否可暂停
  pausable?: boolean;
  // 发行者地址
  issuerAddress?: string;
  // 自定义功能列表
  customFeatures?: string[];
  // 描述
  description?: string;
  // 安全级别
  securityLevel?: SecurityLevel;
  // 是否生成测试
  generateTests?: boolean;
  // 版权声明
  license?: string;
  // 其他自定义选项
  options?: {
    [key: string]: any;
  };
}

/**
 * 智能合约生成响应
 */
export interface ContractGenerationResponse {
  // 合约代码
  code: string;
  // 合约类型
  type: ContractType;
  // 目标链
  chain: ChainType;
  // 合约名称
  name: string;
  // 编译器版本(如适用)
  compilerVersion?: string;
  // ABI(如适用)
  abi?: any[];
  // 字节码(如适用)
  bytecode?: string;
  // 测试代码
  tests?: string;
  // 部署脚本
  deployScript?: string;
  // Readme文件
  readme?: string;
  // 安全提示
  securityNotes?: string[];
  // 最佳实践提示
  bestPractices?: string[];
}

/**
 * 安全审计结果严重性
 */
export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

/**
 * 安全审计发现
 */
export interface AuditFinding {
  // 发现ID
  id: string;
  // 标题
  title: string;
  // 描述
  description: string;
  // 严重性
  severity: AuditSeverity;
  // 代码位置
  location?: {
    // 文件名
    file: string;
    // 行号
    line?: number;
    // 函数名
    function?: string;
  };
  // 缓解建议
  recommendation: string;
  // 是否已解决
  resolved: boolean;
  // CWE标识符
  cwe?: string;
  // CVSS评分
  cvss?: number;
}

/**
 * 安全审计请求
 */
export interface SecurityAuditRequest {
  // 代码内容
  code: string;
  // 合约类型
  contractType: ContractType;
  // 链类型
  chain: ChainType;
  // 审计深度
  depth: 'quick' | 'standard' | 'deep';
  // 额外上下文
  context?: {
    // 合约名称
    name?: string;
    // 合约版本
    version?: string;
    // 编译器版本
    compiler?: string;
    // 其他上下文
    [key: string]: any;
  };
}

/**
 * 安全审计响应
 */
export interface SecurityAuditResponse {
  // 审计ID
  id: string;
  // 审计状态
  status: 'completed' | 'in_progress' | 'failed';
  // 发现列表
  findings: AuditFinding[];
  // 风险摘要
  riskSummary: {
    // 关键风险计数
    critical: number;
    // 高风险计数
    high: number;
    // 中风险计数
    medium: number;
    // 低风险计数
    low: number;
    // 信息性发现计数
    informational: number;
    // 总体风险评分(0-100)
    overallScore: number;
  };
  // 审计报告
  report?: string;
  // 审计时间
  auditedAt: number;
  // 代码覆盖率
  coverage?: {
    // 行覆盖率(%)
    lines: number;
    // 函数覆盖率(%)
    functions: number;
    // 分支覆盖率(%)
    branches: number;
    // 语句覆盖率(%)
    statements: number;
  };
  // 建议的改进
  suggestedImprovements?: string[];
}; 