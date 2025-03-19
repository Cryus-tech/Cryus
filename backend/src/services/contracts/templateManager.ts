import { TokenConfig, TokenFeature, BlockchainType } from '../../models/contractInterfaces';
import { standardBEP20Template } from './templates/bsc/standardBEP20';
import { mintableBEP20Template } from './templates/bsc/mintableBEP20';
import { fullFeatureBEP20Template } from './templates/bsc/fullFeatureBEP20';
import { advancedTaxBEP20Template } from './templates/bsc/advancedTaxBEP20';

/**
 * Contract template interface
 */
export interface ContractTemplate {
  name: string;
  description: string;
  blockchain: BlockchainType;
  features: TokenFeature[];
  abi: any[];
  bytecode: string;
}

/**
 * Template Manager
 * Handles smart contract templates and selection based on token configuration
 */
export class TemplateManager {
  private templates: Map<BlockchainType, ContractTemplate[]> = new Map();

  constructor() {
    this.registerTemplates();
  }

  /**
   * Register all available contract templates
   */
  private registerTemplates(): void {
    // Register BSC templates
    this.registerTemplate(standardBEP20Template);
    this.registerTemplate(mintableBEP20Template);
    this.registerTemplate(fullFeatureBEP20Template);
    this.registerTemplate(advancedTaxBEP20Template);

    // Register templates for other blockchains as they are implemented
    // TODO: Add Ethereum, Polygon, etc. templates
  }

  /**
   * Register a contract template
   * @param template Contract template to register
   */
  public registerTemplate(template: ContractTemplate): void {
    if (!this.templates.has(template.blockchain)) {
      this.templates.set(template.blockchain, []);
    }

    this.templates.get(template.blockchain)!.push(template);
  }

  /**
   * Get a template for the specified token configuration and blockchain
   * @param blockchainType Blockchain type
   * @param tokenConfig Token configuration
   * @returns Contract template or null if no suitable template found
   */
  public getTemplateForToken(blockchainType: BlockchainType, tokenConfig: TokenConfig): ContractTemplate | null {
    const blockchainTemplates = this.templates.get(blockchainType);
    
    if (!blockchainTemplates || blockchainTemplates.length === 0) {
      console.warn(`No templates found for blockchain: ${blockchainType}`);
      return null;
    }

    // Get token features or default to empty array
    const features = tokenConfig.features || [];

    // For BSC, select appropriate BEP20 template based on features
    if (blockchainType === BlockchainType.BSC) {
      return this.selectBSCTemplate(features, blockchainTemplates);
    }

    // For other blockchains, implement similar logic
    // TODO: Add template selection for other blockchains

    // If no specific handling, return the first template for the blockchain (basic template)
    return blockchainTemplates[0];
  }

  /**
   * Get available templates for a blockchain
   * @param blockchainType Blockchain type
   * @returns Array of available templates
   */
  public getAvailableTemplates(blockchainType: BlockchainType): ContractTemplate[] {
    return this.templates.get(blockchainType) || [];
  }

  /**
   * Select the appropriate BSC template based on token features
   * @param features Token features
   * @param templates Available templates
   * @returns Selected template
   */
  private selectBSCTemplate(features: TokenFeature[], templates: ContractTemplate[]): ContractTemplate {
    // Check if tax feature is enabled - use advanced tax template
    if (features.includes(TokenFeature.TAX)) {
      return templates.find(t => t.name.includes('AdvancedTax')) || templates[0];
    }

    // Check if multiple complex features are enabled - use full feature template
    const complexFeatures = [
      TokenFeature.MINTABLE,
      TokenFeature.PAUSABLE,
      TokenFeature.VOTES,
      TokenFeature.SNAPSHOT,
      TokenFeature.ANTI_BOT
    ];

    const complexFeatureCount = features.filter(f => complexFeatures.includes(f)).length;
    if (complexFeatureCount >= 2) {
      return templates.find(t => t.name.includes('FullFeature')) || templates[0];
    }

    // Check if mintable is enabled - use mintable template
    if (features.includes(TokenFeature.MINTABLE)) {
      return templates.find(t => t.name.includes('Mintable')) || templates[0];
    }

    // Default to standard template
    return templates.find(t => t.name.includes('Standard')) || templates[0];
  }
} 