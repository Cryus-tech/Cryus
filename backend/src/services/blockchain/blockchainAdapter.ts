import { 
  BlockchainType, 
  TransactionStatus, 
  TokenConfig,
  DeploymentResult,
  FeeEstimate
} from '../../models/contractInterfaces';
import { ContractTemplate } from '../contracts/templateManager';

/**
 * Abstract base class for blockchain adapters
 * Provides common interface for interacting with different blockchains
 */
export abstract class BlockchainAdapter {
  protected chainType: BlockchainType;
  
  constructor(chainType: BlockchainType) {
    this.chainType = chainType;
  }
  
  /**
   * Gets the blockchain type for this adapter
   * @returns Blockchain type enum value
   */
  getChainType(): BlockchainType {
    return this.chainType;
  }
  
  /**
   * Deploys a contract using a template
   * @param template Contract template with ABI and bytecode
   * @param tokenConfig Token configuration parameters
   * @param privateKey Optional deployer's private key
   * @returns Deployment result including transaction hash and contract address
   */
  abstract deployContract(
    template: ContractTemplate,
    tokenConfig: TokenConfig,
    privateKey?: string
  ): Promise<DeploymentResult>;
  
  /**
   * Deploys a token to the blockchain
   * @param tokenConfig Token configuration parameters
   * @param privateKey Deployer's private key
   * @returns Deployment result including transaction hash and contract address
   */
  abstract deployToken(
    tokenConfig: TokenConfig, 
    privateKey: string
  ): Promise<DeploymentResult>;
  
  /**
   * Estimates the fee for token deployment
   * @param tokenConfig Token configuration
   * @returns Fee estimate in native currency and USD
   */
  abstract estimateDeploymentFee(
    tokenConfig: TokenConfig
  ): Promise<FeeEstimate>;
  
  /**
   * Checks the status of a transaction
   * @param txHash Transaction hash to check
   * @returns Current transaction status
   */
  abstract getTransactionStatus(txHash: string): Promise<TransactionStatus>;
} 