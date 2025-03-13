import axios from 'axios';
import { ethers } from 'ethers';
import { Connection } from '@solana/web3.js';
import { config } from '../../config';
import { ChainType } from '../../models/interfaces';

// 接口常量
const GAS_STATION_URL = 'https://ethgasstation.info/api/ethgasAPI.json';
const POLYGON_GAS_URL = 'https://gasstation-mainnet.matic.network/v2';
const BSC_GAS_URL = 'https://bscgas.info/gas';

/**
 * 费用估算类型
 */
export enum FeeType {
  TRANSFER = 'transfer',           // 转账
  TOKEN_TRANSFER = 'tokenTransfer', // 代币转账
  SWAP = 'swap',                   // 代币交换
  BRIDGE = 'bridge',               // 跨链桥接
  CONTRACT_INTERACTION = 'contractInteraction', // 合约交互
  NFT_MINT = 'nftMint',            // NFT铸造
  NFT_TRANSFER = 'nftTransfer'     // NFT转账
}

/**
 * 费用优先级
 */
export enum FeePriority {
  LOW = 'low',         // 低 (慢)
  STANDARD = 'standard', // 标准
  HIGH = 'high',       // 高 (快)
  URGENT = 'urgent'    // 紧急 (极快)
}

/**
 * 费用估算请求
 */
export interface FeeEstimationRequest {
  // 链类型
  chain: ChainType;
  // 操作类型
  type: FeeType;
  // 费用优先级
  priority?: FeePriority;
  // 交易数据 (如合约调用数据)
  data?: string;
  // 对于桥接, 指定目标链
  targetChain?: ChainType;
  // 代币地址 (用于代币转账)
  tokenAddress?: string;
}

/**
 * 费用估算响应
 */
export interface FeeEstimationResponse {
  // 估算费用 (以当前链的基本单位计, 如wei或lamport)
  fee: string;
  // 以美元计的估算费用
  feeUsd: string;
  // 费用组件细分 (根据链而异)
  details: {
    // 燃料价格 (gwei, 仅EVM链)
    gasPrice?: string;
    // 燃料限制 (仅EVM链)
    gasLimit?: string;
    // 最大燃料费用 (仅EIP-1559)
    maxFeePerGas?: string;
    // 最大优先费用 (仅EIP-1559)
    maxPriorityFeePerGas?: string;
    // 交易大小 (字节)
    size?: number;
    // 其他细节
    [key: string]: any;
  };
  // 预计确认时间 (秒)
  estimatedTime: number;
}

/**
 * 费用估算服务
 */
export class FeeEstimationService {
  private static instance: FeeEstimationService;
  private providers: Map<string, any> = new Map();
  private solanaConnections: Map<string, Connection> = new Map();

  /**
   * 获取服务实例
   */
  public static getInstance(): FeeEstimationService {
    if (!FeeEstimationService.instance) {
      FeeEstimationService.instance = new FeeEstimationService();
    }
    return FeeEstimationService.instance;
  }

  /**
   * 构造函数
   */
  private constructor() {
    // 初始化以太坊提供者
    this.providers.set('ethereum', new ethers.JsonRpcProvider(config.rpc.ethereum));
    this.providers.set('goerli', new ethers.JsonRpcProvider(config.rpc.goerli));
    this.providers.set('sepolia', new ethers.JsonRpcProvider(config.rpc.sepolia));
    
    // 初始化其他EVM链提供者
    this.providers.set('polygon', new ethers.JsonRpcProvider(config.rpc.polygon));
    this.providers.set('mumbai', new ethers.JsonRpcProvider(config.rpc.mumbai));
    this.providers.set('bsc', new ethers.JsonRpcProvider(config.rpc.bsc));
    this.providers.set('bsc-testnet', new ethers.JsonRpcProvider(config.rpc['bsc-testnet']));
    this.providers.set('avalanche', new ethers.JsonRpcProvider(config.rpc.avalanche));
    this.providers.set('fuji', new ethers.JsonRpcProvider(config.rpc.fuji));
    
    // 初始化Solana连接
    this.solanaConnections.set('solana', new Connection(config.rpc.solana));
    this.solanaConnections.set('solana-devnet', new Connection(config.rpc['solana-devnet']));
    this.solanaConnections.set('solana-testnet', new Connection(config.rpc['solana-testnet']));
  }
  
  /**
   * 估算费用
   * @param request 费用估算请求
   * @returns 费用估算响应
   */
  public async estimateFee(request: FeeEstimationRequest): Promise<FeeEstimationResponse> {
    // 设置默认优先级
    const priority = request.priority || FeePriority.STANDARD;
    
    // 基于链类型选择估算方法
    if (request.chain.startsWith('solana')) {
      return this.estimateSolanaFee(request);
    } else {
      return this.estimateEvmFee(request);
    }
  }
  
  /**
   * 估算EVM链费用
   * @param request 费用估算请求
   * @returns 费用估算响应
   */
  private async estimateEvmFee(request: FeeEstimationRequest): Promise<FeeEstimationResponse> {
    const provider = this.providers.get(request.chain);
    
    if (!provider) {
      throw new Error(`不支持的链类型: ${request.chain}`);
    }
    
    // 获取当前燃料价格信息
    const gasPriceInfo = await this.getGasPriceForChain(request.chain, request.priority || FeePriority.STANDARD);
    
    // 估算燃料限制
    const gasLimit = await this.estimateGasLimit(provider, request);
    
    // 计算总费用
    const useEip1559 = await this.supportsEip1559(provider, request.chain);
    let fee: ethers.BigNumber;
    
    const details: any = {
      gasLimit: gasLimit.toString()
    };
    
    if (useEip1559) {
      const { maxFeePerGas, maxPriorityFeePerGas } = gasPriceInfo;
      fee = gasLimit.mul(maxFeePerGas);
      details.maxFeePerGas = maxFeePerGas.toString();
      details.maxPriorityFeePerGas = maxPriorityFeePerGas.toString();
    } else {
      const { gasPrice } = gasPriceInfo;
      fee = gasLimit.mul(gasPrice);
      details.gasPrice = gasPrice.toString();
    }
    
    // 转换为美元
    const feeUsd = await this.convertToUsd(fee.toString(), request.chain);
    
    // 估算确认时间
    const estimatedTime = this.estimateConfirmationTime(request.chain, request.priority || FeePriority.STANDARD);
    
    return {
      fee: fee.toString(),
      feeUsd,
      details,
      estimatedTime
    };
  }
  
  /**
   * 估算Solana费用
   * @param request 费用估算请求
   * @returns 费用估算响应
   */
  private async estimateSolanaFee(request: FeeEstimationRequest): Promise<FeeEstimationResponse> {
    const connection = this.solanaConnections.get(request.chain);
    
    if (!connection) {
      throw new Error(`不支持的链类型: ${request.chain}`);
    }
    
    let recentBlockhash;
    let feeCalculator;

    try {
      const { feeCalculator: fc, blockhash } = await connection.getRecentBlockhash();
      recentBlockhash = blockhash;
      feeCalculator = fc;
    } catch (error) {
      // 新API可能使用getLatestBlockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      recentBlockhash = blockhash;
    }
    
    // 基于交易类型估算费用
    let fee: number;
    
    switch (request.type) {
      case FeeType.TRANSFER:
        fee = await connection.getMinimumBalanceForRentExemption(0);
        break;
      case FeeType.TOKEN_TRANSFER:
        fee = await connection.getMinimumBalanceForRentExemption(65); // SPL Token转账
        break;
      case FeeType.NFT_MINT:
        fee = await connection.getMinimumBalanceForRentExemption(1000); // NFT铸造估计
        break;
      case FeeType.NFT_TRANSFER:
        fee = await connection.getMinimumBalanceForRentExemption(100); // NFT转账
        break;
      case FeeType.CONTRACT_INTERACTION:
        fee = await connection.getMinimumBalanceForRentExemption(200); // 合约交互
        break;
      default:
        fee = await connection.getMinimumBalanceForRentExemption(150); // 默认
    }
    
    // 基于优先级调整
    const priorityMultiplier = this.getSolanaPriorityMultiplier(request.priority || FeePriority.STANDARD);
    fee = fee * priorityMultiplier;
    
    // 转换为美元
    const feeUsd = await this.convertToUsd(fee.toString(), request.chain);
    
    // 估算确认时间
    const estimatedTime = this.estimateConfirmationTime(request.chain, request.priority || FeePriority.STANDARD);
    
    return {
      fee: fee.toString(),
      feeUsd,
      details: {
        size: this.getSolanaTransactionSize(request.type)
      },
      estimatedTime
    };
  }
  
  /**
   * 获取Solana优先级乘数
   * @param priority 优先级
   * @returns 乘数
   */
  private getSolanaPriorityMultiplier(priority: FeePriority): number {
    switch (priority) {
      case FeePriority.LOW:
        return 1.0;
      case FeePriority.STANDARD:
        return 1.2;
      case FeePriority.HIGH:
        return 1.5;
      case FeePriority.URGENT:
        return 2.0;
      default:
        return 1.0;
    }
  }
  
  /**
   * 获取Solana交易大小
   * @param type 交易类型
   * @returns 交易大小(字节)
   */
  private getSolanaTransactionSize(type: FeeType): number {
    switch (type) {
      case FeeType.TRANSFER:
        return 200;
      case FeeType.TOKEN_TRANSFER:
        return 450;
      case FeeType.NFT_MINT:
        return 1500;
      case FeeType.NFT_TRANSFER:
        return 500;
      case FeeType.SWAP:
        return 800;
      case FeeType.BRIDGE:
        return 1200;
      default:
        return 500;
    }
  }
  
  /**
   * 获取链的燃料价格
   * @param chain 链类型
   * @param priority 优先级
   * @returns 燃料价格信息
   */
  private async getGasPriceForChain(chain: string, priority: FeePriority): Promise<any> {
    try {
      const provider = this.providers.get(chain);
      
      if (!provider) {
        throw new Error(`未找到链 ${chain} 的提供者`);
      }
      
      const supportsEip1559 = await this.supportsEip1559(provider, chain);
      
      if (supportsEip1559) {
        return this.getEip1559GasPrice(chain, priority);
      } else {
        return this.getLegacyGasPrice(chain, priority);
      }
    } catch (error) {
      console.error(`获取 ${chain} 的燃料价格失败:`, error);
      
      // 回退到默认值
      return {
        gasPrice: ethers.parseUnits('50', 'gwei'),
        maxFeePerGas: ethers.parseUnits('100', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
      };
    }
  }
  
  /**
   * 获取EIP-1559燃料价格
   * @param chain 链类型
   * @param priority 优先级
   * @returns EIP-1559燃料价格
   */
  private async getEip1559GasPrice(chain: string, priority: FeePriority): Promise<any> {
    const provider = this.providers.get(chain);
    
    if (!provider) {
      throw new Error(`未找到链 ${chain} 的提供者`);
    }
    
    // 获取基础费用
    const feeData = await provider.getFeeData();
    const baseFeePerGas = feeData.lastBaseFeePerGas || ethers.parseUnits('50', 'gwei');
    
    // 根据优先级设置最大优先费用
    let maxPriorityFeePerGas: ethers.BigNumber;
    
    switch (priority) {
      case FeePriority.LOW:
        maxPriorityFeePerGas = ethers.parseUnits('1', 'gwei');
        break;
      case FeePriority.STANDARD:
        maxPriorityFeePerGas = ethers.parseUnits('1.5', 'gwei');
        break;
      case FeePriority.HIGH:
        maxPriorityFeePerGas = ethers.parseUnits('2.5', 'gwei');
        break;
      case FeePriority.URGENT:
        maxPriorityFeePerGas = ethers.parseUnits('5', 'gwei');
        break;
      default:
        maxPriorityFeePerGas = ethers.parseUnits('1.5', 'gwei');
    }
    
    // 计算最大费用
    // maxFeePerGas = (2 * baseFeePerGas) + maxPriorityFeePerGas
    const maxFeePerGas = baseFeePerGas.mul(2).add(maxPriorityFeePerGas);
    
    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
      baseFeePerGas
    };
  }
  
  /**
   * 获取传统燃料价格
   * @param chain 链类型
   * @param priority 优先级
   * @returns 传统燃料价格
   */
  private async getLegacyGasPrice(chain: string, priority: FeePriority): Promise<any> {
    const provider = this.providers.get(chain);
    
    if (!provider) {
      throw new Error(`未找到链 ${chain} 的提供者`);
    }
    
    // 获取基础燃料价格
    const baseGasPrice = await provider.getGasPrice();
    
    // 根据优先级和链调整燃料价格
    let gasPrice: ethers.BigNumber;
    
    switch (priority) {
      case FeePriority.LOW:
        gasPrice = baseGasPrice.mul(80).div(100); // 80%
        break;
      case FeePriority.STANDARD:
        gasPrice = baseGasPrice; // 100%
        break;
      case FeePriority.HIGH:
        gasPrice = baseGasPrice.mul(120).div(100); // 120%
        break;
      case FeePriority.URGENT:
        gasPrice = baseGasPrice.mul(150).div(100); // 150%
        break;
      default:
        gasPrice = baseGasPrice;
    }
    
    return { gasPrice };
  }
  
  /**
   * 检查是否支持EIP-1559
   * @param provider 提供者
   * @param chain 链类型
   * @returns 是否支持EIP-1559
   */
  private async supportsEip1559(provider: any, chain: string): Promise<boolean> {
    // 某些链不支持EIP-1559
    if (chain === 'bsc' || chain === 'bsc-testnet') {
      return false;
    }
    
    try {
      const feeData = await provider.getFeeData();
      return feeData.maxFeePerGas !== null && feeData.maxPriorityFeePerGas !== null;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 估算燃料限制
   * @param provider 提供者
   * @param request 费用估算请求
   * @returns 燃料限制
   */
  private async estimateGasLimit(provider: any, request: FeeEstimationRequest): Promise<ethers.BigNumber> {
    // 基于交易类型提供默认燃料限制
    const defaultGasLimit = this.getDefaultGasLimit(request.type);
    
    // 如果有交易数据, 尝试估算
    if (request.data) {
      try {
        // 创建交易请求
        const tx = {
          data: request.data,
          // 其他交易参数可以在这里添加
        };
        
        // 估算燃料限制
        const estimatedGas = await provider.estimateGas(tx);
        
        // 添加10%的缓冲区
        return estimatedGas.mul(110).div(100);
      } catch (error) {
        console.warn('燃料估算失败, 回退到默认值:', error);
        return defaultGasLimit;
      }
    }
    
    return defaultGasLimit;
  }
  
  /**
   * 获取默认燃料限制
   * @param type 交易类型
   * @returns 默认燃料限制
   */
  private getDefaultGasLimit(type: FeeType): ethers.BigNumber {
    switch (type) {
      case FeeType.TRANSFER:
        return ethers.BigNumber.from(21000); // ETH转账
      case FeeType.TOKEN_TRANSFER:
        return ethers.BigNumber.from(65000); // ERC20转账
      case FeeType.SWAP:
        return ethers.BigNumber.from(200000); // DEX交换
      case FeeType.BRIDGE:
        return ethers.BigNumber.from(250000); // 桥接
      case FeeType.CONTRACT_INTERACTION:
        return ethers.BigNumber.from(150000); // 一般合约交互
      case FeeType.NFT_MINT:
        return ethers.BigNumber.from(300000); // NFT铸造
      case FeeType.NFT_TRANSFER:
        return ethers.BigNumber.from(80000); // NFT转账
      default:
        return ethers.BigNumber.from(100000); // 默认
    }
  }
  
  /**
   * 转换为美元
   * @param fee 费用(原生单位)
   * @param chain 链类型
   * @returns 美元费用
   */
  private async convertToUsd(fee: string, chain: string): Promise<string> {
    try {
      // 获取链的本地代币符号
      const tokenSymbol = this.getChainNativeToken(chain);
      
      // 获取代币的美元价格
      const tokenPrice = await this.getTokenPrice(tokenSymbol);
      
      // 计算单位转换
      const decimals = this.getChainDecimals(chain);
      const feeInTokens = ethers.formatUnits(fee, decimals);
      
      // 计算美元价值
      const feeUsd = parseFloat(feeInTokens) * tokenPrice;
      
      return feeUsd.toFixed(2);
    } catch (error) {
      console.error('转换为美元失败:', error);
      return '0.00';
    }
  }
  
  /**
   * 获取链的原生代币符号
   * @param chain 链类型
   * @returns 代币符号
   */
  private getChainNativeToken(chain: string): string {
    switch (chain) {
      case 'ethereum':
      case 'goerli':
      case 'sepolia':
        return 'ETH';
      case 'polygon':
      case 'mumbai':
        return 'MATIC';
      case 'bsc':
      case 'bsc-testnet':
        return 'BNB';
      case 'avalanche':
      case 'fuji':
        return 'AVAX';
      case 'solana':
      case 'solana-devnet':
      case 'solana-testnet':
        return 'SOL';
      default:
        return 'ETH';
    }
  }
  
  /**
   * 获取链的小数位数
   * @param chain 链类型
   * @returns 小数位数
   */
  private getChainDecimals(chain: string): number {
    switch (chain) {
      case 'solana':
      case 'solana-devnet':
      case 'solana-testnet':
        return 9; // SOL有9个小数位
      default:
        return 18; // 大多数EVM链有18个小数位
    }
  }
  
  /**
   * 获取代币价格
   * @param symbol 代币符号
   * @returns 美元价格
   */
  private async getTokenPrice(symbol: string): Promise<number> {
    try {
      // 调用CoinGecko API获取价格
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${this.getTokenId(symbol)}&vs_currencies=usd`
      );
      
      return response.data[this.getTokenId(symbol)].usd;
    } catch (error) {
      console.error('获取代币价格失败:', error);
      
      // 回退到模拟价格
      return this.getFallbackTokenPrice(symbol);
    }
  }
  
  /**
   * 获取代币ID
   * @param symbol 代币符号
   * @returns CoinGecko代币ID
   */
  private getTokenId(symbol: string): string {
    switch (symbol.toUpperCase()) {
      case 'ETH':
        return 'ethereum';
      case 'MATIC':
        return 'matic-network';
      case 'BNB':
        return 'binancecoin';
      case 'AVAX':
        return 'avalanche-2';
      case 'SOL':
        return 'solana';
      default:
        return 'ethereum';
    }
  }
  
  /**
   * 获取回退代币价格
   * @param symbol 代币符号
   * @returns 回退价格
   */
  private getFallbackTokenPrice(symbol: string): number {
    // 这些只是模拟价格，实际应用应该使用实时价格
    switch (symbol.toUpperCase()) {
      case 'ETH':
        return 2000.0;
      case 'MATIC':
        return 1.0;
      case 'BNB':
        return 300.0;
      case 'AVAX':
        return 20.0;
      case 'SOL':
        return 100.0;
      default:
        return 1.0;
    }
  }
  
  /**
   * 估算确认时间
   * @param chain 链类型
   * @param priority 优先级
   * @returns 估算确认时间(秒)
   */
  private estimateConfirmationTime(chain: string, priority: FeePriority): number {
    // 不同链的基础确认时间
    let baseTime: number;
    
    switch (chain) {
      case 'ethereum':
        baseTime = 15;
        break;
      case 'polygon':
      case 'mumbai':
        baseTime = 5;
        break;
      case 'bsc':
      case 'bsc-testnet':
        baseTime = 3;
        break;
      case 'avalanche':
      case 'fuji':
        baseTime = 2;
        break;
      case 'solana':
      case 'solana-devnet':
      case 'solana-testnet':
        baseTime = 0.5;
        break;
      default:
        baseTime = 15;
    }
    
    // 基于优先级调整时间
    let multiplier: number;
    
    switch (priority) {
      case FeePriority.LOW:
        multiplier = 3.0;
        break;
      case FeePriority.STANDARD:
        multiplier = 1.5;
        break;
      case FeePriority.HIGH:
        multiplier = 1.0;
        break;
      case FeePriority.URGENT:
        multiplier = 0.5;
        break;
      default:
        multiplier = 1.5;
    }
    
    // 计算估算时间(秒)
    return Math.round(baseTime * multiplier * 60);
  }
  
  /**
   * 获取支持的链
   * @returns 支持的链列表
   */
  public getSupportedChains(): string[] {
    return [
      'ethereum', 'goerli', 'sepolia',
      'polygon', 'mumbai',
      'bsc', 'bsc-testnet',
      'avalanche', 'fuji',
      'solana', 'solana-devnet', 'solana-testnet'
    ];
  }
} 