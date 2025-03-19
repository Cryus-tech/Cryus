import { Request, Response } from 'express';
import { TokenConfig, TokenFeature, BlockchainType } from '../models/contractInterfaces';
import { TokenAIService } from '../services/ai/tokenAIService';

// Import BlockchainAdapterFactory
import { BlockchainAdapterFactory } from '../services/blockchain/blockchainAdapterFactory';
import { TemplateManager } from '../services/contracts/templateManager';

// Create singleton instances
const tokenAIService = new TokenAIService();
const templateManager = new TemplateManager();

/**
 * Token Generator Controller
 * Handles AI token generation API requests
 */
export class TokenGeneratorController {
  /**
   * Add a message to the AI conversation
   * @param req Request
   * @param res Response
   */
  public async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Invalid message format'
        });
        return;
      }
      
      await tokenAIService.addUserMessage(message);
      
      const chatHistory = tokenAIService.getChatHistory();
      const analysisResult = tokenAIService.getAnalysisResult();
      
      res.status(200).json({
        success: true,
        data: {
          conversation: chatHistory,
          analysis: analysisResult
        }
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message'
      });
    }
  }
  
  /**
   * Get conversation history
   * @param req Request
   * @param res Response
   */
  public getConversation(req: Request, res: Response): void {
    try {
      const chatHistory = tokenAIService.getChatHistory();
      const analysisResult = tokenAIService.getAnalysisResult();
      
      res.status(200).json({
        success: true,
        data: {
          conversation: chatHistory,
          analysis: analysisResult
        }
      });
    } catch (error) {
      console.error('Error in getConversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve conversation'
      });
    }
  }
  
  /**
   * Reset conversation
   * @param req Request
   * @param res Response
   */
  public resetConversation(req: Request, res: Response): void {
    try {
      tokenAIService.resetConversation();
      
      res.status(200).json({
        success: true,
        message: 'Conversation reset successfully'
      });
    } catch (error) {
      console.error('Error in resetConversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset conversation'
      });
    }
  }
  
  /**
   * Generate token contract based on configuration
   * @param req Request
   * @param res Response
   */
  public async generateToken(req: Request, res: Response): Promise<void> {
    try {
      const { tokenConfig } = req.body;
      
      if (!tokenConfig || typeof tokenConfig !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Invalid token configuration'
        });
        return;
      }
      
      // Validate token configuration
      if (!this.validateTokenConfig(tokenConfig)) {
        res.status(400).json({
          success: false,
          message: 'Token configuration validation failed'
        });
        return;
      }
      
      // Default to BSC blockchain for now
      const blockchainType = BlockchainType.BSC;
      
      // Get the adapter for the specified blockchain
      const adapterFactory = new BlockchainAdapterFactory();
      const adapter = adapterFactory.getAdapter(blockchainType);
      
      if (!adapter) {
        res.status(400).json({
          success: false,
          message: `Blockchain adapter not found for ${blockchainType}`
        });
        return;
      }
      
      // Get template for the token
      const template = templateManager.getTemplateForToken(blockchainType, tokenConfig);
      
      if (!template) {
        res.status(400).json({
          success: false,
          message: 'No suitable template found for the requested token configuration'
        });
        return;
      }
      
      // Compile and deploy the token
      const result = await adapter.deployContract(template, tokenConfig);
      
      res.status(200).json({
        success: true,
        data: {
          deploymentResult: result,
          tokenConfig: tokenConfig
        }
      });
    } catch (error) {
      console.error('Error in generateToken:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate token contract'
      });
    }
  }
  
  /**
   * Get available token features
   * @param req Request
   * @param res Response
   */
  public getTokenFeatures(req: Request, res: Response): void {
    try {
      const features = Object.values(TokenFeature).filter(f => typeof f === 'string');
      
      const formattedFeatures = features.map(feature => ({
        key: feature,
        label: this.getFeatureLabel(feature as TokenFeature),
        description: this.getFeatureDescription(feature as TokenFeature)
      }));
      
      res.status(200).json({
        success: true,
        data: formattedFeatures
      });
    } catch (error) {
      console.error('Error in getTokenFeatures:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve token features'
      });
    }
  }
  
  /**
   * Get available blockchains
   * @param req Request
   * @param res Response
   */
  public getAvailableBlockchains(req: Request, res: Response): void {
    try {
      const blockchains = Object.values(BlockchainType).filter(b => typeof b === 'string');
      
      const formattedBlockchains = blockchains.map(blockchain => ({
        key: blockchain,
        name: this.getBlockchainName(blockchain as BlockchainType),
        logo: this.getBlockchainLogo(blockchain as BlockchainType)
      }));
      
      res.status(200).json({
        success: true,
        data: formattedBlockchains
      });
    } catch (error) {
      console.error('Error in getAvailableBlockchains:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available blockchains'
      });
    }
  }
  
  /**
   * Get available templates for a blockchain
   * @param req Request
   * @param res Response
   */
  public getAvailableTemplates(req: Request, res: Response): void {
    try {
      const { blockchain } = req.params;
      
      if (!blockchain || !Object.values(BlockchainType).includes(blockchain as BlockchainType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid blockchain specified'
        });
        return;
      }
      
      const templates = templateManager.getAvailableTemplates(blockchain as BlockchainType);
      
      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error in getAvailableTemplates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available templates'
      });
    }
  }
  
  /**
   * Validate token configuration
   * @param config Token configuration
   */
  private validateTokenConfig(config: TokenConfig): boolean {
    // Basic validation
    if (!config.name || !config.symbol || config.decimals === undefined || !config.initialSupply) {
      return false;
    }
    
    // Symbol validation (2-6 characters)
    if (config.symbol.length < 2 || config.symbol.length > 6) {
      return false;
    }
    
    // Decimals validation (0-18)
    if (config.decimals < 0 || config.decimals > 18) {
      return false;
    }
    
    // Check that initialSupply is a valid number
    if (isNaN(Number(config.initialSupply))) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get label for token feature
   * @param feature Token feature
   */
  private getFeatureLabel(feature: TokenFeature): string {
    const labels: Record<TokenFeature, string> = {
      [TokenFeature.MINTABLE]: 'Mintable',
      [TokenFeature.BURNABLE]: 'Burnable',
      [TokenFeature.PAUSABLE]: 'Pausable',
      [TokenFeature.PERMIT]: 'Permit',
      [TokenFeature.VOTES]: 'Votes',
      [TokenFeature.SNAPSHOT]: 'Snapshot',
      [TokenFeature.FLASH_MINTING]: 'Flash Minting',
      [TokenFeature.ANTI_BOT]: 'Anti-Bot',
      [TokenFeature.LIQUIDITY_GENERATOR]: 'Liquidity Generator',
      [TokenFeature.TAX]: 'Transaction Tax',
      [TokenFeature.MAX_TRANSACTION]: 'Max Transaction',
      [TokenFeature.MAX_WALLET]: 'Max Wallet',
      [TokenFeature.BLACKLIST]: 'Blacklist'
    };
    
    return labels[feature] || String(feature);
  }
  
  /**
   * Get description for token feature
   * @param feature Token feature
   */
  private getFeatureDescription(feature: TokenFeature): string {
    const descriptions: Record<TokenFeature, string> = {
      [TokenFeature.MINTABLE]: 'Allows creating new tokens after initial deployment',
      [TokenFeature.BURNABLE]: 'Allows token holders to destroy their tokens',
      [TokenFeature.PAUSABLE]: 'Allows pausing all token transfers in emergency situations',
      [TokenFeature.PERMIT]: 'Enables gasless approvals through signatures',
      [TokenFeature.VOTES]: 'Supports on-chain governance and voting',
      [TokenFeature.SNAPSHOT]: 'Enables creating snapshots of token balances at specific blocks',
      [TokenFeature.FLASH_MINTING]: 'Allows temporary token minting for flash loans',
      [TokenFeature.ANTI_BOT]: 'Implements measures to prevent bot trading',
      [TokenFeature.LIQUIDITY_GENERATOR]: 'Automatically generates liquidity for DEX pools',
      [TokenFeature.TAX]: 'Applies fees on token transfers, buys, or sells',
      [TokenFeature.MAX_TRANSACTION]: 'Limits the maximum amount that can be transferred in a single transaction',
      [TokenFeature.MAX_WALLET]: 'Limits the maximum amount that can be held in a single wallet',
      [TokenFeature.BLACKLIST]: 'Allows blocking specific addresses from trading'
    };
    
    return descriptions[feature] || '';
  }
  
  /**
   * Get blockchain name
   * @param blockchain Blockchain type
   */
  private getBlockchainName(blockchain: BlockchainType): string {
    const names: Record<BlockchainType, string> = {
      [BlockchainType.ETHEREUM]: 'Ethereum',
      [BlockchainType.BSC]: 'BNB Smart Chain',
      [BlockchainType.POLYGON]: 'Polygon',
      [BlockchainType.ARBITRUM]: 'Arbitrum',
      [BlockchainType.AVALANCHE]: 'Avalanche',
      [BlockchainType.OPTIMISM]: 'Optimism',
      [BlockchainType.SOLANA]: 'Solana'
    };
    
    return names[blockchain] || String(blockchain);
  }
  
  /**
   * Get blockchain logo URL
   * @param blockchain Blockchain type
   */
  private getBlockchainLogo(blockchain: BlockchainType): string {
    const logos: Record<BlockchainType, string> = {
      [BlockchainType.ETHEREUM]: '/assets/logos/ethereum.svg',
      [BlockchainType.BSC]: '/assets/logos/bsc.svg',
      [BlockchainType.POLYGON]: '/assets/logos/polygon.svg',
      [BlockchainType.ARBITRUM]: '/assets/logos/arbitrum.svg',
      [BlockchainType.AVALANCHE]: '/assets/logos/avalanche.svg',
      [BlockchainType.OPTIMISM]: '/assets/logos/optimism.svg',
      [BlockchainType.SOLANA]: '/assets/logos/solana.svg'
    };
    
    return logos[blockchain] || '';
  }
} 