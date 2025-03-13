/**
 * 区块链API类型定义
 */

// 钱包类型
export interface WalletBalance {
  sol: number;
  usd_value: number;
  tokens: TokenBalance[];
}

// 代币余额类型
export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  usd_value?: number;
}

// NFT类型
export interface NFT {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  image_url?: string;
  description?: string;
  attributes?: NFTAttribute[];
  owner: string;
  collection?: {
    name: string;
    family: string;
  };
  creators?: {
    address: string;
    share: number;
    verified: boolean;
  }[];
}

// NFT属性类型
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

// 交易类型
export interface Transaction {
  id: string;
  hash: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  symbol?: string;
  mint?: string;
  from: string;
  to: string;
  timestamp: string;
  confirmations: number;
  block_number?: number;
  details?: any;
}

// 交易类型枚举
export enum TransactionType {
  TOKEN_TRANSFER = 'token_transfer',
  TOKEN_MINT = 'token_mint',
  TOKEN_BURN = 'token_burn',
  NFT_TRANSFER = 'nft_transfer',
  NFT_MINT = 'nft_mint',
  SOL_TRANSFER = 'sol_transfer',
  OTHER = 'other',
}

// 交易状态枚举
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

// 网络状态类型
export interface NetworkStatus {
  name: string;
  current_slot: number;
  transaction_count: number;
  recent_tps: number;
  is_healthy: boolean;
  average_fee: number;
}

// 代币价格类型
export interface TokenPrice {
  symbol: string;
  price_usd: number;
  market_cap_usd?: number;
  volume_24h_usd?: number;
  change_24h_percent?: number;
}

// 算法交易策略类型
export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  asset: string;
  type: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  execution_count: number;
  success_count: number;
  failure_count: number;
  profit_loss: number;
  profit_loss_percentage: number;
  conditions: any[];
  actions: any[];
  parameters: Record<string, any>;
  is_active: boolean;
}

// 策略执行结果类型
export interface StrategyExecution {
  id: string;
  strategy_id: string;
  status: 'success' | 'failed';
  timestamp: string;
  actions_performed: any[];
  result: any;
  error?: string;
  transaction_hash?: string;
}

// 回测结果类型
export interface BacktestResult {
  id: string;
  strategy_name: string;
  asset: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_capital: number;
  profit_loss: number;
  profit_loss_percentage: number;
  trades_count: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  max_drawdown: number;
  sharpe_ratio: number;
  trades: BacktestTrade[];
  performance_data: PerformancePoint[];
}

// 回测交易类型
export interface BacktestTrade {
  id: string;
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  value: number;
  profit_loss?: number;
  profit_loss_percentage?: number;
}

// 性能数据点类型
export interface PerformancePoint {
  date: string;
  strategy_value: number;
  hold_value: number;
  asset_price: number;
}

// 风险分析类型
export interface RiskAnalysis {
  total_portfolio_value: number;
  change_percentage: number;
  change_24h: number;
  risk_score: number;
  diversification_score: number;
  volatility: number;
  assets: RiskAsset[];
}

// 风险资产类型
export interface RiskAsset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  allocation: number;
  change_24h: number;
  risk: 'low' | 'medium' | 'high';
}

// 风险偏好类型
export interface RiskPreference {
  risk_tolerance: number;
  investment_horizon: string;
  rebalancing_frequency: string;
  max_loss_percentage: number;
  auto_rebalancing: boolean;
  stop_loss_enabled: boolean;
  notifications_enabled: boolean;
  risk_protection_level: 'conservative' | 'moderate' | 'aggressive';
}

// 市场概览类型
export interface MarketOverview {
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  market_cap_change_24h: number;
  volume_change_24h: number;
  fear_greed_index: number;
  fear_greed_label: string;
}

// 币种数据类型
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  change_1h: number;
  change_24h: number;
  change_7d: number;
  supply: number;
  ath: number;
  ath_date: string;
  ath_percentage: number;
}

// 价格历史数据点类型
export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  volume?: number;
}

// 新闻条目类型
export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: number;
} 