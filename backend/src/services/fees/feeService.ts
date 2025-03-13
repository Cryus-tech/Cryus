import { ethers } from 'ethers';
import { 
  Connection, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  SystemProgram,
  Transaction 
} from '@solana/web3.js';
import axios from 'axios';
import { BlockchainType } from '../bridge/bridgeService';

/**
 * Fee level enumeration
 * Defines transaction priority
 */
export enum FeeLevel {
  LOW = 'low',      // Slow, low fee
  MEDIUM = 'medium', // Medium speed and fee
  HIGH = 'high',    // Fast, high fee
  CUSTOM = 'custom'  // Custom fee
}

/**
 * Fee estimation result interface
 */
export interface FeeEstimate {
  fee: string;            // Base fee (in native blockchain units)
  feeInUSD: number;       // Fee in USD (estimated)
  timeEstimate: string;   // Estimated confirmation time (description)
  gasLimit?: number;      // Ethereum: Gas limit
  maxFee?: string;        // Ethereum: Maximum total fee
  maxPriorityFee?: string; // Ethereum: Maximum priority fee
  baseFee?: string;       // Ethereum: Base fee
}

/**
 * Fee estimation service configuration interface
 */
export interface FeeServiceConfig {
  ethRpcUrl: string;          // Ethereum RPC URL
  solanaRpcUrl: string;       // Solana RPC URL
  bnbRpcUrl?: string;         // BNB Chain RPC URL (optional)
  priceApiUrl?: string;       // Cryptocurrency price API URL (optional)
}

/**
 * Fee estimation service
 * Provides fee estimates for different blockchain networks
 */
export class FeeService {
  private ethProvider: ethers.JsonRpcProvider;
  private solanaConnection: Connection;
  private bnbProvider?: ethers.JsonRpcProvider;
  private priceApiUrl: string;
  
  // Cached price data
  private priceCache: { [symbol: string]: { price: number; timestamp: number } } = {};
  private readonly PRICE_CACHE_TTL = 60 * 1000; // 1 minute
  
  /**
   * Constructor
   * @param config Service configuration
   */
  constructor(config: FeeServiceConfig) {
    this.ethProvider = new ethers.JsonRpcProvider(config.ethRpcUrl);
    this.solanaConnection = new Connection(config.solanaRpcUrl);
    
    if (config.bnbRpcUrl) {
      this.bnbProvider = new ethers.JsonRpcProvider(config.bnbRpcUrl);
    }
    
    this.priceApiUrl = config.priceApiUrl || 'https://api.coingecko.com/api/v3/simple/price';
  }
  
  /**
   * Estimate Ethereum network transaction fee
   * @param level Fee level
   * @param customGasPrice Custom gas price (optional)
   * @param customMaxPriorityFee Custom max priority fee (optional)
   */
  async estimateEthereumFee(
    level: FeeLevel,
    customGasPrice?: bigint,
    customMaxPriorityFee?: bigint
  ): Promise<FeeEstimate> {
    try {
      // Get current block details
      const feeData = await this.ethProvider.getFeeData();
      
      // Base fee (current block's baseFeePerGas)
      const baseFee = feeData.gasPrice !== null ? feeData.gasPrice : BigInt(0);
      
      // Default gas limit for transfers
      const gasLimit = 21000;
      
      // Calculate maxPriorityFeePerGas based on level
      let maxPriorityFee: bigint;
      let timeEstimate: string;
      
      if (level === FeeLevel.CUSTOM && customMaxPriorityFee) {
        maxPriorityFee = customMaxPriorityFee;
        timeEstimate = 'Custom priority';
      } else {
        switch (level) {
          case FeeLevel.LOW:
            maxPriorityFee = BigInt(1000000000); // 1 gwei
            timeEstimate = '5-10 minutes';
            break;
          case FeeLevel.MEDIUM:
            maxPriorityFee = BigInt(1500000000); // 1.5 gwei
            timeEstimate = '2-5 minutes';
            break;
          case FeeLevel.HIGH:
            maxPriorityFee = BigInt(2500000000); // 2.5 gwei
            timeEstimate = '< 30 seconds';
            break;
          default:
            maxPriorityFee = BigInt(1000000000); // Default 1 gwei
            timeEstimate = '5-10 minutes';
        }
      }
      
      // Calculate maxFeePerGas (baseFee + maxPriorityFee)
      let maxFee: bigint;
      
      if (level === FeeLevel.CUSTOM && customGasPrice) {
        maxFee = customGasPrice;
      } else {
        // baseFee * 1.2 + maxPriorityFee, add 20% buffer to baseFee
        maxFee = baseFee + (baseFee * BigInt(20) / BigInt(100)) + maxPriorityFee;
      }
      
      // Calculate total fee
      const fee = (maxFee * BigInt(gasLimit)).toString();
      
      // Convert to ETH (Ethereum: wei -> ether)
      const feeInETH = parseFloat(ethers.formatEther(fee));
      
      // Get ETH price
      const ethPrice = await this.getCryptoPrice('ethereum');
      
      // Calculate fee in USD
      const feeInUSD = feeInETH * ethPrice;
      
      return {
        fee,
        feeInUSD,
        timeEstimate,
        gasLimit,
        maxFee: maxFee.toString(),
        maxPriorityFee: maxPriorityFee.toString(),
        baseFee: baseFee.toString()
      };
    } catch (error) {
      console.error('Ethereum fee estimation failed:', error);
      throw new Error(`Ethereum fee estimation failed: ${error.message}`);
    }
  }
  
  /**
   * Estimate Solana network transaction fee
   * @param level Fee level
   * @param customPriority Custom priority value (optional)
   */
  async estimateSolanaFee(
    level: FeeLevel,
    customPriority?: number
  ): Promise<FeeEstimate> {
    try {
      // Get latest blockhash (for transaction building)
      const { blockhash } = await this.solanaConnection.getLatestBlockhash();
      
      // Create a dummy transaction to estimate fees
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: new PublicKey('11111111111111111111111111111111')
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey('11111111111111111111111111111111'),
          toPubkey: new PublicKey('11111111111111111111111111111111'),
          lamports: 1000 // Minimum transfer amount
        })
      );
      
      // Get base fee
      const baseFee = await this.solanaConnection.getFeeForMessage(
        transaction.compileMessage()
      );
      
      if (!baseFee || !baseFee.value) {
        throw new Error('Could not get Solana base fee');
      }
      
      // Solana fees are fixed, but we can add extra compute units (CU) based on priority
      let priorityFee = 0;
      let timeEstimate: string;
      
      if (level === FeeLevel.CUSTOM && customPriority !== undefined) {
        priorityFee = customPriority;
        timeEstimate = 'Custom priority';
      } else {
        switch (level) {
          case FeeLevel.LOW:
            priorityFee = 1000; // 1000 microLamports/CU
            timeEstimate = '10-20 seconds';
            break;
          case FeeLevel.MEDIUM:
            priorityFee = 10000; // 10000 microLamports/CU
            timeEstimate = '5-10 seconds';
            break;
          case FeeLevel.HIGH:
            priorityFee = 100000; // 100000 microLamports/CU
            timeEstimate = '< 5 seconds';
            break;
          default:
            priorityFee = 1000;
            timeEstimate = '10-20 seconds';
        }
      }
      
      // Assume transaction uses 200,000 CU (reasonable estimate)
      const estimatedCU = 200000;
      
      // Calculate priority fee (microLamports -> lamports)
      const priorityFeeInLamports = Math.floor((priorityFee * estimatedCU) / 1000000);
      
      // Total fee = base fee + priority fee
      const totalFeeInLamports = baseFee.value + priorityFeeInLamports;
      
      // Convert to SOL
      const feeInSOL = totalFeeInLamports / LAMPORTS_PER_SOL;
      
      // Get SOL price
      const solPrice = await this.getCryptoPrice('solana');
      
      // Calculate fee in USD
      const feeInUSD = feeInSOL * solPrice;
      
      return {
        fee: totalFeeInLamports.toString(),
        feeInUSD,
        timeEstimate
      };
    } catch (error) {
      console.error('Solana fee estimation failed:', error);
      throw new Error(`Solana fee estimation failed: ${error.message}`);
    }
  }
  
  /**
   * Estimate BNB Chain network transaction fee
   * @param level Fee level
   * @param customGasPrice Custom gas price (optional)
   */
  async estimateBNBChainFee(
    level: FeeLevel,
    customGasPrice?: bigint
  ): Promise<FeeEstimate> {
    if (!this.bnbProvider) {
      throw new Error('BNB Chain provider not configured');
    }
    
    try {
      // Get current gas price
      const gasPrice = await this.bnbProvider.getGasPrice();
      
      // Default gas limit for transfers
      const gasLimit = 21000;
      
      // Adjust gas price based on level
      let adjustedGasPrice: bigint;
      let timeEstimate: string;
      
      if (level === FeeLevel.CUSTOM && customGasPrice) {
        adjustedGasPrice = customGasPrice;
        timeEstimate = 'Custom priority';
      } else {
        switch (level) {
          case FeeLevel.LOW:
            adjustedGasPrice = gasPrice - (gasPrice * BigInt(20) / BigInt(100)); // -20%
            timeEstimate = '1-3 minutes';
            break;
          case FeeLevel.MEDIUM:
            adjustedGasPrice = gasPrice;
            timeEstimate = '30 seconds - 1 minute';
            break;
          case FeeLevel.HIGH:
            adjustedGasPrice = gasPrice + (gasPrice * BigInt(20) / BigInt(100)); // +20%
            timeEstimate = '< 30 seconds';
            break;
          default:
            adjustedGasPrice = gasPrice;
            timeEstimate = '30 seconds - 1 minute';
        }
      }
      
      // Calculate total fee
      const fee = (adjustedGasPrice * BigInt(gasLimit)).toString();
      
      // Convert to BNB (wei -> BNB)
      const feeInBNB = parseFloat(ethers.formatEther(fee));
      
      // Get BNB price
      const bnbPrice = await this.getCryptoPrice('binancecoin');
      
      // Calculate fee in USD
      const feeInUSD = feeInBNB * bnbPrice;
      
      return {
        fee,
        feeInUSD,
        timeEstimate,
        gasLimit,
        maxFee: adjustedGasPrice.toString()
      };
    } catch (error) {
      console.error('BNB Chain fee estimation failed:', error);
      throw new Error(`BNB Chain fee estimation failed: ${error.message}`);
    }
  }
  
  /**
   * Estimate fee based on blockchain type
   * @param blockchainType Blockchain type
   * @param level Fee level
   */
  async estimateFee(
    blockchainType: BlockchainType,
    level: FeeLevel = FeeLevel.MEDIUM
  ): Promise<FeeEstimate> {
    switch (blockchainType) {
      case BlockchainType.ETHEREUM:
        return this.estimateEthereumFee(level);
      case BlockchainType.SOLANA:
        return this.estimateSolanaFee(level);
      case BlockchainType.BNB:
        return this.estimateBNBChainFee(level);
      default:
        throw new Error(`Unsupported blockchain type: ${blockchainType}`);
    }
  }
  
  /**
   * Estimate cross-chain bridge fee
   * @param sourceFee Source chain fee
   * @param targetFee Target chain fee
   * @param bridgeFee Bridge service fee
   */
  estimateBridgeFee(
    sourceFee: FeeEstimate,
    targetFee: FeeEstimate,
    bridgeFee: number // Bridge service fee (USD)
  ): {
    totalFeeUSD: number;
    breakdown: {
      sourceFeeUSD: number;
      targetFeeUSD: number;
      bridgeFeeUSD: number;
    }
  } {
    const totalFeeUSD = sourceFee.feeInUSD + targetFee.feeInUSD + bridgeFee;
    
    return {
      totalFeeUSD,
      breakdown: {
        sourceFeeUSD: sourceFee.feeInUSD,
        targetFeeUSD: targetFee.feeInUSD,
        bridgeFeeUSD: bridgeFee
      }
    };
  }
  
  /**
   * Get current cryptocurrency price
   * @param symbol Cryptocurrency ID (e.g., 'ethereum', 'solana', 'binancecoin')
   * @returns Price in USD
   */
  private async getCryptoPrice(symbol: string): Promise<number> {
    // Check cache
    const cached = this.priceCache[symbol];
    if (cached && Date.now() - cached.timestamp < this.PRICE_CACHE_TTL) {
      return cached.price;
    }
    
    try {
      const response = await axios.get(this.priceApiUrl, {
        params: {
          ids: symbol,
          vs_currencies: 'usd'
        }
      });
      
      if (response.data && response.data[symbol] && response.data[symbol].usd) {
        const price = response.data[symbol].usd;
        
        // Update cache
        this.priceCache[symbol] = {
          price,
          timestamp: Date.now()
        };
        
        return price;
      } else {
        throw new Error(`Could not get price data for ${symbol}`);
      }
    } catch (error) {
      console.error(`Failed to get ${symbol} price:`, error);
      
      // If API call fails but cache exists, return expired cache
      if (cached) {
        console.warn(`Using expired ${symbol} price data`);
        return cached.price;
      }
      
      // Use default values
      const defaultPrices: { [key: string]: number } = {
        'ethereum': 2000,
        'solana': 100,
        'binancecoin': 300
      };
      
      console.warn(`Using default price for ${symbol}: $${defaultPrices[symbol] || 1}`);
      return defaultPrices[symbol] || 1;
    }
  }
} 