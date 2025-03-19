import { ethers } from 'ethers';
import { BlockchainAdapter } from './blockchainAdapter';
import { TemplateManager } from '../contracts/templateManager';
import { 
  BlockchainType, 
  TransactionStatus, 
  TokenConfig,
  DeploymentResult,
  FeeEstimate,
  NetworkConfig
} from '../../models/contractInterfaces';
import { ContractTemplate } from '../contracts/templateManager';

/**
 * BSC Network Adapter for communication with the BNB Smart Chain
 */
export class BSCAdapter extends BlockchainAdapter {
  private provider: ethers.providers.JsonRpcProvider;
  private networkConfig: NetworkConfig;
  private templateManager: TemplateManager;
  
  /**
   * Constructor for BSC Adapter
   * @param nodeUrl BSC RPC node URL
   * @param chainId BSC Chain ID (56 for mainnet, 97 for testnet)
   */
  constructor(nodeUrl: string, chainId: number = 56) {
    super(BlockchainType.BSC);
    this.provider = new ethers.providers.JsonRpcProvider(nodeUrl);
    this.networkConfig = {
      chainId,
      name: chainId === 56 ? 'BSC Mainnet' : 'BSC Testnet',
      currencySymbol: 'BNB',
      blockExplorerUrl: chainId === 56 
        ? 'https://bscscan.com' 
        : 'https://testnet.bscscan.com'
    };
    this.templateManager = new TemplateManager();
  }
  
  /**
   * Deploy a contract using the provided template and configuration
   * @param template Contract template
   * @param tokenConfig Token configuration
   * @param privateKey Optional private key for deployment
   * @returns Deployment result
   */
  async deployContract(template: ContractTemplate, tokenConfig: TokenConfig, privateKey?: string): Promise<DeploymentResult> {
    try {
      // Create a wallet with private key if provided, otherwise create a temporary wallet
      const wallet = privateKey 
        ? new ethers.Wallet(privateKey, this.provider)
        : ethers.Wallet.createRandom().connect(this.provider);
      
      // Create contract factory
      const factory = new ethers.ContractFactory(template.abi, template.bytecode, wallet);
      
      // Prepare constructor arguments based on token config
      const args = this.prepareConstructorArgs(tokenConfig);
      
      // Deploy the contract
      const contract = await factory.deploy(...args);
      
      // Wait for deployment confirmation
      await contract.deployed();
      
      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(contract.deployTransaction.hash);
      
      return {
        success: true,
        contractAddress: contract.address,
        txHash: contract.deployTransaction.hash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        chainType: BlockchainType.BSC,
        explorerUrl: `${this.networkConfig.blockExplorerUrl}/address/${contract.address}`
      };
    } catch (error) {
      console.error('Error deploying contract:', error);
      
      return {
        success: false,
        timestamp: Date.now(),
        chainType: BlockchainType.BSC,
        error: error.message || 'Unknown error during deployment'
      };
    }
  }
  
  /**
   * Deploy a token to the blockchain
   * @param tokenConfig Token configuration
   * @param privateKey Deployer's private key
   * @returns Deployment result
   */
  async deployToken(tokenConfig: TokenConfig, privateKey: string): Promise<DeploymentResult> {
    try {
      // Get the appropriate template
      const template = this.templateManager.getTemplateForToken(BlockchainType.BSC, tokenConfig);
      
      if (!template) {
        throw new Error('No suitable template found for the token configuration');
      }
      
      // Deploy the contract using the template
      return this.deployContract(template, tokenConfig, privateKey);
    } catch (error) {
      console.error('Error in deployToken:', error);
      
      return {
        success: false,
        timestamp: Date.now(),
        chainType: BlockchainType.BSC,
        error: error.message || 'Unknown error during token deployment'
      };
    }
  }
  
  /**
   * Estimate deployment fee for a token
   * @param tokenConfig Token configuration
   * @returns Fee estimate
   */
  async estimateDeploymentFee(tokenConfig: TokenConfig): Promise<FeeEstimate> {
    try {
      // Get the appropriate template
      const template = this.templateManager.getTemplateForToken(BlockchainType.BSC, tokenConfig);
      
      if (!template) {
        throw new Error('No suitable template found for the token configuration');
      }
      
      // Create a temporary wallet for estimation
      const wallet = ethers.Wallet.createRandom().connect(this.provider);
      
      // Create contract factory
      const factory = new ethers.ContractFactory(template.abi, template.bytecode, wallet);
      
      // Prepare constructor arguments
      const args = this.prepareConstructorArgs(tokenConfig);
      
      // Estimate gas
      const gasEstimate = await factory.estimateGas.deploy(...args);
      
      // Get current gas price
      const gasPrice = await this.provider.getGasPrice();
      
      // Calculate fee in BNB
      const feeInWei = gasEstimate.mul(gasPrice);
      const feeInBNB = ethers.utils.formatEther(feeInWei);
      
      // Get current BNB price in USD (simplified, would use an oracle in production)
      const bnbUsdPrice = await this.getBNBUsdPrice();
      
      // Calculate fee in USD
      const feeInUSD = parseFloat(feeInBNB) * bnbUsdPrice;
      
      return {
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        fee: {
          amount: feeInBNB,
          currency: this.networkConfig.currencySymbol
        },
        feeUSD: feeInUSD.toFixed(2)
      };
    } catch (error) {
      console.error('Error estimating deployment fee:', error);
      throw error;
    }
  }
  
  /**
   * Check the status of a transaction
   * @param txHash Transaction hash
   * @returns Transaction status information
   */
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    try {
      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          status: 'PENDING',
          confirmations: 0,
          blockNumber: null,
          timestamp: Date.now()
        };
      }
      
      // Get latest block number for confirmation count
      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber + 1;
      
      // Get block to retrieve timestamp
      const block = await this.provider.getBlock(receipt.blockNumber);
      
      return {
        status: receipt.status ? 'CONFIRMED' : 'FAILED',
        confirmations,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: block.timestamp * 1000, // Convert to milliseconds
        error: receipt.status ? null : 'Transaction execution failed'
      };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return {
        status: 'ERROR',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Prepare constructor arguments for token deployment
   * @param tokenConfig Token configuration
   * @returns Array of constructor arguments
   */
  private prepareConstructorArgs(tokenConfig: TokenConfig): any[] {
    // Basic arguments for standard BEP20
    const args = [
      tokenConfig.name,
      tokenConfig.symbol,
      tokenConfig.decimals,
      ethers.utils.parseUnits(String(tokenConfig.initialSupply), tokenConfig.decimals)
    ];
    
    // Add owner address if specified, otherwise use a random address
    if (tokenConfig.owner) {
      args.push(tokenConfig.owner);
    }
    
    // Return the prepared arguments
    return args;
  }
  
  /**
   * Get current BNB price in USD
   * Note: In a production environment, this would use a proper price oracle
   * @returns Current BNB price in USD
   */
  private async getBNBUsdPrice(): Promise<number> {
    // Simplified implementation - would use an oracle in production
    // For now, return a fixed price
    return 400; // Example BNB price in USD
  }
} 