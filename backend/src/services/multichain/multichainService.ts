import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import { ChainType } from '../../models/interfaces';
import { config } from '../../config';
import { FeeEstimationService, FeeType, FeePriority } from '../fees/feeEstimationService';

/**
 * 多链交易类型
 */
export enum MultiChainTxType {
  NATIVE_TRANSFER = 'nativeTransfer',     // 原生代币转账
  TOKEN_TRANSFER = 'tokenTransfer',       // 代币转账
  TOKEN_APPROVAL = 'tokenApproval',       // 代币授权
  CONTRACT_INTERACTION = 'contractInteraction', // 合约交互
  NFT_TRANSFER = 'nftTransfer',          // NFT转账
  CROSS_CHAIN_TRANSFER = 'crossChainTransfer' // 跨链转账
}

/**
 * 多链交易请求
 */
export interface MultiChainTxRequest {
  // 交易类型
  type: MultiChainTxType;
  // 源链
  sourceChain: ChainType;
  // 发送方地址
  fromAddress: string;
  // 接收方地址
  toAddress: string;
  // 金额(字符串以避免精度问题)
  amount: string;
  // 代币地址(如果适用)
  tokenAddress?: string;
  // 合约方法(如果适用)
  contractMethod?: string;
  // 合约参数(如果适用)
  contractParams?: any[];
  // 目标链(如果是跨链交易)
  targetChain?: ChainType;
  // 燃料价格优先级
  priority?: FeePriority;
  // 燃料限制(EVM链)
  gasLimit?: string;
  // 备注/注释
  memo?: string;
}

/**
 * 多链交易响应
 */
export interface MultiChainTxResponse {
  // 交易是否成功
  success: boolean;
  // 交易哈希
  txHash?: string;
  // 交易ID(用于跨链交易)
  txId?: string;
  // 错误信息(如果失败)
  error?: string;
  // 交易数据
  data?: any;
  // 交易费用(原生代币单位)
  fee?: string;
  // 交易费用(美元)
  feeUsd?: string;
  // 估计确认时间(秒)
  estimatedConfirmationTime?: number;
}

/**
 * 多链区块链服务
 */
export class MultiChainService {
  private static instance: MultiChainService;
  private providers: Map<string, any> = new Map();
  private solanaConnections: Map<string, Connection> = new Map();
  private feeService: FeeEstimationService;
  
  /**
   * 获取服务实例
   */
  public static getInstance(): MultiChainService {
    if (!MultiChainService.instance) {
      MultiChainService.instance = new MultiChainService();
    }
    return MultiChainService.instance;
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
    
    // 初始化费用估算服务
    this.feeService = FeeEstimationService.getInstance();
  }
  
  /**
   * 执行交易
   * @param request 多链交易请求
   * @returns 多链交易响应
   */
  public async executeTransaction(request: MultiChainTxRequest): Promise<MultiChainTxResponse> {
    try {
      // 基于链类型和交易类型选择处理方法
      if (request.sourceChain.startsWith('solana')) {
        return this.executeSolanaTransaction(request);
      } else {
        return this.executeEvmTransaction(request);
      }
    } catch (error) {
      console.error('执行交易失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
  
  /**
   * 执行EVM链交易
   * @param request 多链交易请求
   * @returns 多链交易响应
   */
  private async executeEvmTransaction(request: MultiChainTxRequest): Promise<MultiChainTxResponse> {
    const provider = this.providers.get(request.sourceChain);
    
    if (!provider) {
      throw new Error(`不支持的链类型: ${request.sourceChain}`);
    }
    
    // 获取钱包
    const wallet = await this.getEvmWallet(request.fromAddress, request.sourceChain);
    
    // 准备交易参数
    let tx: any;
    let feeTxType: FeeType;
    
    // 基于交易类型创建交易对象
    switch (request.type) {
      case MultiChainTxType.NATIVE_TRANSFER:
        tx = {
          to: request.toAddress,
          value: ethers.parseEther(request.amount)
        };
        feeTxType = FeeType.TRANSFER;
        break;
        
      case MultiChainTxType.TOKEN_TRANSFER:
        if (!request.tokenAddress) {
          throw new Error('代币转账需要提供代币地址');
        }
        tx = await this.prepareErc20Transfer(
          wallet, 
          request.tokenAddress, 
          request.toAddress, 
          request.amount
        );
        feeTxType = FeeType.TOKEN_TRANSFER;
        break;
        
      case MultiChainTxType.NFT_TRANSFER:
        if (!request.tokenAddress) {
          throw new Error('NFT转账需要提供NFT合约地址');
        }
        tx = await this.prepareErc721Transfer(
          wallet,
          request.tokenAddress,
          request.fromAddress,
          request.toAddress,
          request.amount // 对于ERC-721，这是tokenId
        );
        feeTxType = FeeType.NFT_TRANSFER;
        break;
        
      case MultiChainTxType.TOKEN_APPROVAL:
        if (!request.tokenAddress) {
          throw new Error('代币授权需要提供代币地址');
        }
        tx = await this.prepareErc20Approval(
          wallet,
          request.tokenAddress,
          request.toAddress, // spender地址
          request.amount
        );
        feeTxType = FeeType.CONTRACT_INTERACTION;
        break;
        
      case MultiChainTxType.CONTRACT_INTERACTION:
        if (!request.contractMethod || !request.contractParams) {
          throw new Error('合约交互需要提供方法名和参数');
        }
        tx = await this.prepareContractInteraction(
          wallet,
          request.toAddress, // 合约地址
          request.contractMethod,
          request.contractParams,
          request.amount
        );
        feeTxType = FeeType.CONTRACT_INTERACTION;
        break;
        
      case MultiChainTxType.CROSS_CHAIN_TRANSFER:
        // 跨链转账由专门的桥接服务处理
        throw new Error('跨链转账应通过桥接服务处理');
        
      default:
        throw new Error(`不支持的交易类型: ${request.type}`);
    }
    
    // 计算交易费用
    const feeEstimation = await this.feeService.estimateFee({
      chain: request.sourceChain,
      type: feeTxType,
      priority: request.priority,
      data: tx.data
    });
    
    // 添加费用相关参数
    if (feeEstimation.details.maxFeePerGas && feeEstimation.details.maxPriorityFeePerGas) {
      // EIP-1559交易
      tx.maxFeePerGas = ethers.BigInt(feeEstimation.details.maxFeePerGas);
      tx.maxPriorityFeePerGas = ethers.BigInt(feeEstimation.details.maxPriorityFeePerGas);
    } else if (feeEstimation.details.gasPrice) {
      // 传统交易
      tx.gasPrice = ethers.BigInt(feeEstimation.details.gasPrice);
    }
    
    // 设置燃料限制
    if (request.gasLimit) {
      tx.gasLimit = ethers.BigInt(request.gasLimit);
    } else if (feeEstimation.details.gasLimit) {
      tx.gasLimit = ethers.BigInt(feeEstimation.details.gasLimit);
    }
    
    // 发送交易
    try {
      const txResponse = await wallet.sendTransaction(tx);
      return {
        success: true,
        txHash: txResponse.hash,
        fee: feeEstimation.fee,
        feeUsd: feeEstimation.feeUsd,
        estimatedConfirmationTime: feeEstimation.estimatedTime
      };
    } catch (error) {
      console.error('发送交易失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送交易失败'
      };
    }
  }
  
  /**
   * 准备ERC-20代币转账
   * @param wallet 钱包
   * @param tokenAddress 代币地址
   * @param toAddress 接收方地址
   * @param amount 金额
   * @returns 交易对象
   */
  private async prepareErc20Transfer(
    wallet: ethers.Wallet,
    tokenAddress: string,
    toAddress: string,
    amount: string
  ): Promise<any> {
    // ERC-20 ABI
    const erc20Abi = [
      'function decimals() view returns (uint8)',
      'function transfer(address to, uint256 amount) returns (bool)'
    ];
    
    // 创建合约接口
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
    
    // 获取代币小数位数
    const decimals = await tokenContract.decimals();
    
    // 解析金额
    const parsedAmount = ethers.parseUnits(amount, decimals);
    
    // 编码转账方法
    const data = tokenContract.interface.encodeFunctionData('transfer', [toAddress, parsedAmount]);
    
    // 返回交易对象
    return {
      to: tokenAddress,
      data
    };
  }
  
  /**
   * 准备ERC-721 NFT转账
   * @param wallet 钱包
   * @param tokenAddress NFT合约地址
   * @param fromAddress 发送方地址
   * @param toAddress 接收方地址
   * @param tokenId 代币ID
   * @returns 交易对象
   */
  private async prepareErc721Transfer(
    wallet: ethers.Wallet,
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    tokenId: string
  ): Promise<any> {
    // ERC-721 ABI
    const erc721Abi = [
      'function safeTransferFrom(address from, address to, uint256 tokenId) external'
    ];
    
    // 创建合约接口
    const nftContract = new ethers.Contract(tokenAddress, erc721Abi, wallet);
    
    // 编码转账方法
    const data = nftContract.interface.encodeFunctionData('safeTransferFrom', [
      fromAddress,
      toAddress,
      ethers.BigInt(tokenId)
    ]);
    
    // 返回交易对象
    return {
      to: tokenAddress,
      data
    };
  }
  
  /**
   * 准备ERC-20代币授权
   * @param wallet 钱包
   * @param tokenAddress 代币地址
   * @param spenderAddress 授权地址
   * @param amount 金额
   * @returns 交易对象
   */
  private async prepareErc20Approval(
    wallet: ethers.Wallet,
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<any> {
    // ERC-20 ABI
    const erc20Abi = [
      'function decimals() view returns (uint8)',
      'function approve(address spender, uint256 amount) returns (bool)'
    ];
    
    // 创建合约接口
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
    
    // 获取代币小数位数
    const decimals = await tokenContract.decimals();
    
    // 解析金额
    const parsedAmount = amount === 'max' 
      ? ethers.MaxUint256 
      : ethers.parseUnits(amount, decimals);
    
    // 编码授权方法
    const data = tokenContract.interface.encodeFunctionData('approve', [spenderAddress, parsedAmount]);
    
    // 返回交易对象
    return {
      to: tokenAddress,
      data
    };
  }
  
  /**
   * 准备合约交互
   * @param wallet 钱包
   * @param contractAddress 合约地址
   * @param method 方法名
   * @param params 参数
   * @param value 发送的ETH金额
   * @returns 交易对象
   */
  private async prepareContractInteraction(
    wallet: ethers.Wallet,
    contractAddress: string,
    method: string,
    params: any[],
    value?: string
  ): Promise<any> {
    // 简单ABI - 在实际应用中应该使用完整ABI
    const contractInterface = new ethers.Interface([`function ${method}`]);
    
    // 编码方法调用
    const data = contractInterface.encodeFunctionData(method, params);
    
    // 返回交易对象
    const tx: any = {
      to: contractAddress,
      data
    };
    
    // 如果提供了金额，则添加value字段
    if (value && parseFloat(value) > 0) {
      tx.value = ethers.parseEther(value);
    }
    
    return tx;
  }
  
  /**
   * 执行Solana交易
   * @param request 多链交易请求
   * @returns 多链交易响应
   */
  private async executeSolanaTransaction(request: MultiChainTxRequest): Promise<MultiChainTxResponse> {
    // 这里应该实现Solana交易执行逻辑
    throw new Error('Solana交易执行尚未实现');
  }
  
  /**
   * 获取EVM钱包
   * @param address 地址
   * @param chain 链类型
   * @returns 钱包
   */
  private async getEvmWallet(address: string, chain: string): Promise<ethers.Wallet> {
    // 在实际应用中，应该使用更安全的密钥管理方式
    // 这里假设从环境变量获取私钥，但这不是推荐的做法
    const privateKey = process.env[`${chain.toUpperCase()}_PRIVATE_KEY`];
    
    if (!privateKey) {
      throw new Error(`未找到链 ${chain} 的私钥`);
    }
    
    const provider = this.providers.get(chain);
    
    if (!provider) {
      throw new Error(`未找到链 ${chain} 的提供者`);
    }
    
    return new ethers.Wallet(privateKey, provider);
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
  
  /**
   * 检查链是否支持
   * @param chain 链类型
   * @returns 是否支持
   */
  public isChainSupported(chain: string): boolean {
    return this.getSupportedChains().includes(chain);
  }
  
  /**
   * 验证地址格式
   * @param address 地址
   * @param chain 链类型
   * @returns 是否有效
   */
  public validateAddress(address: string, chain: string): boolean {
    try {
      if (chain.startsWith('solana')) {
        // 验证Solana地址
        return PublicKey.isOnCurve(new PublicKey(address));
      } else {
        // 验证EVM地址
        return ethers.isAddress(address);
      }
    } catch (error) {
      return false;
    }
  }
} 