import { ethers } from 'ethers';
import axios from 'axios';
import { WalletBalance, TokenBalance, Transaction, TransactionStatus, TransactionType } from '../../models/interfaces';
import { ERC20_ABI } from '../../utils/contractABIs';

/**
 * BNB Chain服务配置接口
 */
export interface BNBChainServiceConfig {
  rpcUrl: string;               // BNB Chain RPC URL
  bscScanApiKey?: string;       // BSCScan API 密钥（可选）
  bscScanApiUrl?: string;       // BSCScan API URL（可选）
  providerTimeout?: number;     // 提供者超时时间（毫秒）
}

/**
 * BNB Chain服务
 * 提供与BNB Chain交互的方法，包括余额查询、转账等
 */
export class BNBChainService {
  private provider: ethers.JsonRpcProvider;
  private bscScanApiKey: string;
  private bscScanApiUrl: string;
  
  /**
   * 构造函数
   * @param config 服务配置
   */
  constructor(config: BNBChainServiceConfig) {
    // 初始化提供者
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl, undefined, {
      timeout: config.providerTimeout || 30000
    });
    
    // 设置BSCScan API信息
    this.bscScanApiKey = config.bscScanApiKey || '';
    this.bscScanApiUrl = config.bscScanApiUrl || 'https://api.bscscan.com/api';
  }
  
  /**
   * 获取BNB余额
   * @param address 钱包地址
   * @returns BNB余额（以BNB为单位）
   */
  async getBNBBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('获取BNB余额失败:', error);
      throw new Error(`获取BNB余额失败: ${error.message}`);
    }
  }
  
  /**
   * 获取代币余额
   * @param address 钱包地址
   * @param tokenAddress 代币合约地址
   * @param decimals 代币小数位数（可选，将自动从合约获取）
   * @returns 代币余额
   */
  async getTokenBalance(
    address: string,
    tokenAddress: string,
    decimals?: number
  ): Promise<string> {
    try {
      // 创建合约实例
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      
      // 获取余额
      const balance = await contract.balanceOf(address);
      
      // 如果未提供小数位，从合约获取
      if (decimals === undefined) {
        try {
          decimals = await contract.decimals();
        } catch (error) {
          console.warn(`无法从合约获取小数位数，使用默认值 18:`, error);
          decimals = 18;
        }
      }
      
      // 格式化余额
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('获取代币余额失败:', error);
      throw new Error(`获取代币余额失败: ${error.message}`);
    }
  }
  
  /**
   * 获取钱包的BNB和代币余额
   * @param address 钱包地址
   * @param includeTokens 是否包括代币余额
   * @returns 钱包余额信息
   */
  async getWalletBalance(address: string, includeTokens: boolean = true): Promise<WalletBalance> {
    try {
      // 获取BNB余额
      const bnbBalance = await this.getBNBBalance(address);
      
      // 初始化钱包余额结构
      const walletBalance: WalletBalance = {
        address,
        balance: bnbBalance,
        tokens: []
      };
      
      // 如果需要包含代币余额
      if (includeTokens) {
        // 从BSCScan获取代币列表
        const tokens = await this.getTokens(address);
        walletBalance.tokens = tokens;
      }
      
      return walletBalance;
    } catch (error) {
      console.error('获取钱包余额失败:', error);
      throw new Error(`获取钱包余额失败: ${error.message}`);
    }
  }
  
  /**
   * 从BSCScan获取地址持有的代币列表
   * @param address 钱包地址
   * @returns 代币余额列表
   */
  private async getTokens(address: string): Promise<TokenBalance[]> {
    if (!this.bscScanApiKey) {
      console.warn('未配置BSCScan API密钥，无法获取代币列表');
      return [];
    }
    
    try {
      const response = await axios.get(this.bscScanApiUrl, {
        params: {
          module: 'account',
          action: 'tokenlist',
          address,
          apikey: this.bscScanApiKey
        }
      });
      
      if (response.data.status === '1' && Array.isArray(response.data.result)) {
        // 处理返回的代币列表
        return response.data.result.map((token: any) => ({
          mint: token.contractAddress,
          symbol: token.symbol,
          name: token.name,
          amount: ethers.formatUnits(token.balance || '0', parseInt(token.decimals) || 18),
          decimals: parseInt(token.decimals) || 18
        }));
      } else {
        console.warn('BSCScan返回错误:', response.data);
        return [];
      }
    } catch (error) {
      console.error('从BSCScan获取代币列表失败:', error);
      return [];
    }
  }
  
  /**
   * 发送BNB
   * @param privateKey 发送者私钥
   * @param toAddress 接收地址
   * @param amount 发送金额（以BNB为单位）
   * @returns 交易哈希
   */
  async sendBNB(
    privateKey: string,
    toAddress: string,
    amount: string
  ): Promise<string> {
    try {
      // 创建钱包
      const wallet = new ethers.Wallet(privateKey, this.provider);
      
      // 转换金额为wei
      const amountWei = ethers.parseEther(amount);
      
      // 构建交易对象
      const tx = {
        to: toAddress,
        value: amountWei
      };
      
      // 发送交易
      const txResponse = await wallet.sendTransaction(tx);
      
      // 等待交易被挖出
      const receipt = await txResponse.wait();
      
      if (!receipt) {
        throw new Error('交易未被确认');
      }
      
      return txResponse.hash;
    } catch (error) {
      console.error('发送BNB失败:', error);
      throw new Error(`发送BNB失败: ${error.message}`);
    }
  }
  
  /**
   * 发送代币
   * @param privateKey 发送者私钥
   * @param tokenAddress 代币合约地址
   * @param toAddress 接收地址
   * @param amount 发送金额（以代币单位计）
   * @param decimals 代币小数位数（如果不指定，将自动从合约获取）
   * @returns 交易哈希
   */
  async sendToken(
    privateKey: string,
    tokenAddress: string,
    toAddress: string,
    amount: string,
    decimals?: number
  ): Promise<string> {
    try {
      // 创建钱包
      const wallet = new ethers.Wallet(privateKey, this.provider);
      
      // 创建合约实例
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
      
      // 如果未提供小数位，从合约获取
      if (decimals === undefined) {
        try {
          decimals = await contract.decimals();
        } catch (error) {
          console.warn(`无法从合约获取小数位数，使用默认值 18:`, error);
          decimals = 18;
        }
      }
      
      // 转换金额
      const amountInSmallestUnit = ethers.parseUnits(amount, decimals);
      
      // 发送代币
      const txResponse = await contract.transfer(toAddress, amountInSmallestUnit);
      
      // 等待交易被挖出
      const receipt = await txResponse.wait();
      
      if (!receipt) {
        throw new Error('交易未被确认');
      }
      
      return txResponse.hash;
    } catch (error) {
      console.error('发送代币失败:', error);
      throw new Error(`发送代币失败: ${error.message}`);
    }
  }
  
  /**
   * 获取交易详情
   * @param txHash 交易哈希
   * @returns 交易详情
   */
  async getTransaction(txHash: string): Promise<Transaction> {
    try {
      // 获取交易信息
      const tx = await this.provider.getTransaction(txHash);
      
      if (!tx) {
        throw new Error('找不到交易');
      }
      
      // 获取交易收据
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      // 确定交易状态
      let status = TransactionStatus.PENDING;
      if (receipt) {
        status = receipt.status === 1 ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED;
      }
      
      // 确定交易类型
      let type = TransactionType.UNKNOWN;
      let toAddress = tx.to;
      let fromAddress = tx.from;
      
      // 检查是否为原生BNB转账
      if (tx.data === '0x' && tx.value > BigInt(0)) {
        type = TransactionType.TRANSFER;
      } 
      // 检查是否为代币转账
      else if (tx.data.startsWith('0xa9059cbb')) {
        type = TransactionType.TOKEN_TRANSFER;
        
        // 解析代币转账详情（"transfer(address,uint256)"函数）
        try {
          // 接收者地址在数据的前32字节之后的32字节中
          const addressHex = '0x' + tx.data.substring(34, 74);
          toAddress = ethers.getAddress(addressHex);
          
          // 获取合约地址（代币地址）
          toAddress = tx.to;
        } catch (error) {
          console.warn('无法解析代币转账接收者:', error);
        }
      }
      
      // 创建交易对象
      const transaction: Transaction = {
        id: txHash,
        hash: txHash,
        type,
        status,
        amount: tx.value.toString(),
        fee: receipt ? (receipt.gasUsed * receipt.gasPrice).toString() : '0',
        from: fromAddress || '',
        to: toAddress || '',
        timestamp: new Date().getTime(), // 暂时使用当前时间
        confirmations: receipt ? 1 : 0
      };
      
      // 如果有区块信息，尝试获取实际时间戳
      if (receipt && receipt.blockNumber) {
        try {
          const block = await this.provider.getBlock(receipt.blockNumber);
          if (block && block.timestamp) {
            transaction.timestamp = Number(block.timestamp) * 1000; // 转换为毫秒
          }
        } catch (error) {
          console.warn('获取区块时间戳失败:', error);
        }
      }
      
      return transaction;
    } catch (error) {
      console.error('获取交易详情失败:', error);
      throw new Error(`获取交易详情失败: ${error.message}`);
    }
  }
  
  /**
   * 获取地址的交易历史
   * @param address 钱包地址
   * @param page 页码（从1开始）
   * @param limit 每页数量
   * @returns 交易列表
   */
  async getTransactionHistory(
    address: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Transaction[]> {
    if (!this.bscScanApiKey) {
      throw new Error('未配置BSCScan API密钥，无法获取交易历史');
    }
    
    try {
      // 从BSCScan获取交易历史
      const response = await axios.get(this.bscScanApiUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          page,
          offset: limit,
          sort: 'desc',
          apikey: this.bscScanApiKey
        }
      });
      
      if (response.data.status === '1' && Array.isArray(response.data.result)) {
        // 处理返回的交易列表
        return response.data.result.map((tx: any) => {
          // 确定交易类型
          let type = TransactionType.UNKNOWN;
          
          if (tx.input === '0x' && parseInt(tx.value) > 0) {
            type = TransactionType.TRANSFER;
          } else if (tx.input.startsWith('0xa9059cbb')) {
            type = TransactionType.TOKEN_TRANSFER;
          }
          
          // 确定交易状态
          const status = parseInt(tx.txreceipt_status) === 1 
            ? TransactionStatus.CONFIRMED 
            : (parseInt(tx.txreceipt_status) === 0 ? TransactionStatus.FAILED : TransactionStatus.PENDING);
          
          return {
            id: tx.hash,
            hash: tx.hash,
            type,
            status,
            amount: tx.value,
            fee: (BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString(),
            from: tx.from,
            to: tx.to,
            timestamp: parseInt(tx.timeStamp) * 1000, // 转换为毫秒
            confirmations: parseInt(tx.confirmations) || 0
          };
        });
      } else {
        console.warn('BSCScan返回错误:', response.data);
        return [];
      }
    } catch (error) {
      console.error('获取交易历史失败:', error);
      throw new Error(`获取交易历史失败: ${error.message}`);
    }
  }
  
  /**
   * 获取代币交易历史
   * @param address 钱包地址
   * @param tokenAddress 代币合约地址
   * @param page 页码（从1开始）
   * @param limit 每页数量
   * @returns 交易列表
   */
  async getTokenTransactionHistory(
    address: string,
    tokenAddress: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Transaction[]> {
    if (!this.bscScanApiKey) {
      throw new Error('未配置BSCScan API密钥，无法获取代币交易历史');
    }
    
    try {
      // 从BSCScan获取代币交易历史
      const response = await axios.get(this.bscScanApiUrl, {
        params: {
          module: 'account',
          action: 'tokentx',
          contractaddress: tokenAddress,
          address,
          page,
          offset: limit,
          sort: 'desc',
          apikey: this.bscScanApiKey
        }
      });
      
      if (response.data.status === '1' && Array.isArray(response.data.result)) {
        // 处理返回的代币交易列表
        return response.data.result.map((tx: any) => {
          // 代币交易类型
          const type = TransactionType.TOKEN_TRANSFER;
          
          // 计算代币数量（考虑小数位数）
          const decimals = parseInt(tx.tokenDecimal) || 18;
          const amount = ethers.formatUnits(tx.value, decimals);
          
          return {
            id: tx.hash,
            hash: tx.hash,
            type,
            status: TransactionStatus.CONFIRMED, // BSCScan只返回确认的交易
            amount,
            fee: '0', // BSCScan不提供Gas费用信息
            from: tx.from,
            to: tx.to,
            timestamp: parseInt(tx.timeStamp) * 1000, // 转换为毫秒
            confirmations: parseInt(tx.confirmations) || 0,
            details: {
              tokenAddress: tx.contractAddress,
              tokenSymbol: tx.tokenSymbol,
              tokenName: tx.tokenName,
              tokenDecimal: decimals
            }
          };
        });
      } else {
        console.warn('BSCScan返回错误:', response.data);
        return [];
      }
    } catch (error) {
      console.error('获取代币交易历史失败:', error);
      throw new Error(`获取代币交易历史失败: ${error.message}`);
    }
  }
  
  /**
   * 估算BNB转账的Gas费用
   * @param fromAddress 发送地址
   * @param toAddress 接收地址
   * @param amount 发送金额（以BNB为单位）
   * @returns Gas费用估算（以BNB为单位）
   */
  async estimateGasFee(
    fromAddress: string,
    toAddress: string,
    amount: string
  ): Promise<string> {
    try {
      // 转换金额为wei
      const amountWei = ethers.parseEther(amount);
      
      // 获取当前Gas价格
      const gasPrice = await this.provider.getGasPrice();
      
      // 估算Gas用量
      const gasEstimate = await this.provider.estimateGas({
        from: fromAddress,
        to: toAddress,
        value: amountWei
      });
      
      // 计算总费用
      const totalFee = gasEstimate * gasPrice;
      
      // 转换为BNB并返回
      return ethers.formatEther(totalFee);
    } catch (error) {
      console.error('估算Gas费用失败:', error);
      throw new Error(`估算Gas费用失败: ${error.message}`);
    }
  }
  
  /**
   * 估算代币转账的Gas费用
   * @param fromAddress 发送地址
   * @param tokenAddress 代币合约地址
   * @param toAddress 接收地址
   * @param amount 发送金额（以代币为单位）
   * @param decimals 代币小数位数（可选）
   * @returns Gas费用估算（以BNB为单位）
   */
  async estimateTokenGasFee(
    fromAddress: string,
    tokenAddress: string,
    toAddress: string,
    amount: string,
    decimals?: number
  ): Promise<string> {
    try {
      // 创建合约实例
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      
      // 如果未提供小数位，从合约获取
      if (decimals === undefined) {
        try {
          decimals = await contract.decimals();
        } catch (error) {
          console.warn(`无法从合约获取小数位数，使用默认值 18:`, error);
          decimals = 18;
        }
      }
      
      // 转换金额
      const amountInSmallestUnit = ethers.parseUnits(amount, decimals);
      
      // 获取当前Gas价格
      const gasPrice = await this.provider.getGasPrice();
      
      // 创建交易数据
      const data = contract.interface.encodeFunctionData('transfer', [toAddress, amountInSmallestUnit]);
      
      // 估算Gas用量
      const gasEstimate = await this.provider.estimateGas({
        from: fromAddress,
        to: tokenAddress,
        data
      });
      
      // 计算总费用
      const totalFee = gasEstimate * gasPrice;
      
      // 转换为BNB并返回
      return ethers.formatEther(totalFee);
    } catch (error) {
      console.error('估算代币转账Gas费用失败:', error);
      throw new Error(`估算代币转账Gas费用失败: ${error.message}`);
    }
  }
} 