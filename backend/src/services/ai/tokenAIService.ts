import { TokenConfig, TokenFeature, BlockchainType } from '../../models/contractInterfaces';

/**
 * Chat history item interface
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * AI analysis result interface
 */
export interface AIAnalysisResult {
  tokenConfig: TokenConfig;
  projectSummary: string;
  suggestedFeatures: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    concerns: string[];
  };
  aiConfidence: number;
}

/**
 * Token AI Service Class - Processes user conversations and extracts token information
 */
export class TokenAIService {
  private chatHistory: ChatMessage[] = [];
  private lastAnalysisResult: AIAnalysisResult | null = null;
  
  /**
   * Add user message to conversation history
   * @param message User message content
   */
  public async addUserMessage(message: string): Promise<void> {
    this.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });
    
    // Process user message and generate response
    await this.generateAIResponse();
  }
  
  /**
   * Get complete conversation history
   */
  public getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }
  
  /**
   * Get the latest AI analysis result
   */
  public getAnalysisResult(): AIAnalysisResult | null {
    return this.lastAnalysisResult;
  }
  
  /**
   * Reset conversation history and analysis results
   */
  public resetConversation(): void {
    this.chatHistory = [];
    this.lastAnalysisResult = null;
  }
  
  /**
   * Update token configuration based on current conversation
   * @param currentConfig Current token configuration
   */
  public updateTokenConfig(currentConfig?: Partial<TokenConfig>): TokenConfig {
    const analysis = this.lastAnalysisResult;
    
    if (!analysis) {
      // Return default configuration
      return {
        name: "",
        symbol: "",
        decimals: 18,
        initialSupply: "1000000",
        features: [TokenFeature.BURNABLE]
      };
    }
    
    // Merge current config with AI analysis result
    return {
      ...analysis.tokenConfig,
      ...currentConfig
    };
  }
  
  /**
   * Generate AI response and analyze token information
   * This function simulates interaction with AI service
   */
  private async generateAIResponse(): Promise<void> {
    // Get the latest user message
    const lastUserMessage = this.chatHistory.filter(m => m.role === 'user').pop();
    
    if (!lastUserMessage) return;
    
    try {
      // In actual implementation, this would call a large language model API (like OpenAI's GPT)
      // This is a simplified implementation, we use predefined analysis logic
      
      const analysisResult = await this.analyzeUserIntent(lastUserMessage.content);
      this.lastAnalysisResult = analysisResult;
      
      // Generate AI response
      const aiResponse = this.createResponseFromAnalysis(analysisResult);
      
      // Add AI response to conversation history
      this.chatHistory.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Add error response
      this.chatHistory.push({
        role: 'assistant',
        content: 'Sorry, I encountered a problem processing your request. Please try again or provide more information.',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Analyze user input and extract token configuration information
   * @param userInput User input
   */
  private async analyzeUserIntent(userInput: string): Promise<AIAnalysisResult> {
    // In actual implementation, this would call a natural language processing service
    // This is a simplified implementation, we use rule-based analysis
    
    const lowercaseInput = userInput.toLowerCase();
    
    // Extract token name (look for keywords like "token name", "token" or "name" followed by content)
    let tokenName = this.extractInformation(userInput, ['token name', 'name is', 'called', 'named'], 20);
    if (!tokenName) {
      // Try to use words starting with capital letters in the sentence as possible token names
      const possibleNames = userInput.match(/[A-Z][a-z]+/g);
      if (possibleNames && possibleNames.length > 0) {
        tokenName = possibleNames[0];
      } else {
        tokenName = "MyToken"; // Default name
      }
    }
    
    // Extract token symbol (usually 2-6 uppercase letters)
    let tokenSymbol = this.extractInformation(userInput, ['token symbol', 'symbol is', 'ticker'], 8);
    if (!tokenSymbol) {
      // Look for uppercase letters in parentheses as possible symbols
      const symbolMatch = userInput.match(/\(([A-Z]{2,6})\)/);
      if (symbolMatch) {
        tokenSymbol = symbolMatch[1];
      } else {
        // Use the first letters of the token name
        tokenSymbol = tokenName.replace(/[aeiou]/gi, '').substring(0, 4).toUpperCase();
      }
    }
    
    // Extract initial supply
    let initialSupply = this.extractInformation(userInput, ['initial supply', 'token amount', 'supply'], 20);
    if (!initialSupply || isNaN(Number(initialSupply.replace(/,/g, '')))) {
      // Look for parts containing numbers as possible supply amounts
      const supplyMatch = userInput.match(/(\d{1,3}(,\d{3})*(\.\d+)?)\s*(million|m|M)/i);
      if (supplyMatch) {
        // Process "million" or "m" to represent millions
        const baseNumber = Number(supplyMatch[1].replace(/,/g, ''));
        initialSupply = String(baseNumber * 1000000);
      } else {
        initialSupply = "1000000"; // Default supply
      }
    }
    
    // Determine token decimals
    let decimals = 18; // Default is 18, conforming to most ERC-20 and BEP-20 standards
    if (lowercaseInput.includes('decimal') || lowercaseInput.includes('precision')) {
      const decimalsMatch = userInput.match(/decimal[s]? (?:is|are|=|:)?(\d+)/i);
      if (decimalsMatch) {
        decimals = parseInt(decimalsMatch[1]);
      }
    }
    
    // Detect required features
    const features: TokenFeature[] = [TokenFeature.BURNABLE]; // Default burnable
    
    if (lowercaseInput.includes('mint') || lowercaseInput.includes('create new') || 
        lowercaseInput.includes('issue more') || lowercaseInput.includes('mintable')) {
      features.push(TokenFeature.MINTABLE);
    }
    
    if (lowercaseInput.includes('pause') || lowercaseInput.includes('freeze') || 
        lowercaseInput.includes('stop trading')) {
      features.push(TokenFeature.PAUSABLE);
    }
    
    if (lowercaseInput.includes('tax') || lowercaseInput.includes('fee') || 
        lowercaseInput.includes('transaction fee')) {
      features.push(TokenFeature.TAX);
    }
    
    if (lowercaseInput.includes('vote') || lowercaseInput.includes('governance') || 
        lowercaseInput.includes('voting')) {
      features.push(TokenFeature.VOTES);
    }
    
    if (lowercaseInput.includes('snapshot')) {
      features.push(TokenFeature.SNAPSHOT);
    }
    
    if (lowercaseInput.includes('bot') || lowercaseInput.includes('anti-bot') || 
        lowercaseInput.includes('antibot')) {
      features.push(TokenFeature.ANTI_BOT);
    }
    
    if (lowercaseInput.includes('blacklist') || lowercaseInput.includes('ban')) {
      features.push(TokenFeature.BLACKLIST);
    }
    
    // Build metadata
    const metadata: any = {};
    
    // Extract website information
    const website = this.extractInformation(userInput, ['website', 'site', 'homepage'], 50);
    if (website) {
      metadata.website = website;
    }
    
    // Extract social media information
    const twitter = this.extractInformation(userInput, ['twitter'], 30);
    const telegram = this.extractInformation(userInput, ['telegram'], 30);
    if (twitter || telegram) {
      metadata.socials = {};
      if (twitter) metadata.socials.twitter = twitter;
      if (telegram) metadata.socials.telegram = telegram;
    }
    
    // If tax feature is enabled, extract tax-related information
    if (features.includes(TokenFeature.TAX)) {
      const buyTaxMatch = userInput.match(/buy tax (?:is|=|:)?(\d+)%/i);
      const sellTaxMatch = userInput.match(/sell tax (?:is|=|:)?(\d+)%/i);
      
      if (buyTaxMatch || sellTaxMatch) {
        metadata.taxConfig = {};
        if (buyTaxMatch) {
          metadata.taxConfig.buyTax = parseInt(buyTaxMatch[1]);
        }
        if (sellTaxMatch) {
          metadata.taxConfig.sellTax = parseInt(sellTaxMatch[1]);
        }
      }
    }
    
    // Create token configuration
    const tokenConfig: TokenConfig = {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: decimals,
      initialSupply: initialSupply,
      features: features,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined
    };
    
    // Project summary and suggestions
    let projectSummary = `Based on your description, I understand you want to create a token named "${tokenName}" (${tokenSymbol}).`;
    projectSummary += `\n\nThe initial supply will be ${initialSupply} with ${decimals} decimals.`;
    
    if (features.length > 1) {
      projectSummary += `\n\nYour token will have the following features: ${features.map(f => this.getFeatureDescription(f)).join(', ')}.`;
    }
    
    // Suggested features
    const suggestedFeatures: string[] = [];
    if (!features.includes(TokenFeature.MINTABLE)) {
      suggestedFeatures.push("Consider adding mintable functionality to issue more tokens in the future based on project needs");
    }
    
    if (!features.includes(TokenFeature.PAUSABLE) && (features.includes(TokenFeature.TAX) || features.includes(TokenFeature.ANTI_BOT))) {
      suggestedFeatures.push("Consider adding pause functionality to halt token transfers in emergency situations");
    }
    
    // Risk assessment
    const riskConcerns: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (features.includes(TokenFeature.MINTABLE)) {
      riskConcerns.push("Mintable functionality can lead to token inflation risk, ensure appropriate governance mechanisms");
      riskLevel = 'medium';
    }
    
    if (features.includes(TokenFeature.TAX) && (!metadata.taxConfig || metadata.taxConfig.buyTax > 10 || metadata.taxConfig.sellTax > 15)) {
      riskConcerns.push("High transaction tax rates can impact liquidity and user experience");
      riskLevel = 'high';
    }
    
    return {
      tokenConfig,
      projectSummary,
      suggestedFeatures,
      riskAssessment: {
        level: riskLevel,
        concerns: riskConcerns
      },
      aiConfidence: 0.85 // Simulated confidence value
    };
  }
  
  /**
   * Create AI response based on analysis results
   * @param analysis AI analysis result
   */
  private createResponseFromAnalysis(analysis: AIAnalysisResult): string {
    let response = `${analysis.projectSummary}\n\n`;
    
    if (analysis.suggestedFeatures.length > 0) {
      response += "**Suggestions:**\n";
      response += analysis.suggestedFeatures.map(s => `- ${s}`).join('\n');
      response += "\n\n";
    }
    
    response += "**Risk Assessment:**\n";
    response += `Risk Level: ${this.getRiskLevelText(analysis.riskAssessment.level)}\n`;
    
    if (analysis.riskAssessment.concerns.length > 0) {
      response += analysis.riskAssessment.concerns.map(c => `- ${c}`).join('\n');
      response += "\n\n";
    } else {
      response += "- No significant risks identified\n\n";
    }
    
    response += "I have generated an initial token configuration based on your requirements. Please review the form on the right and make any adjustments as needed.";
    
    return response;
  }
  
  /**
   * Extract specific information from text
   * @param text Text content
   * @param keywords List of keywords
   * @param maxLength Maximum extraction length
   */
  private extractInformation(text: string, keywords: string[], maxLength: number): string | null {
    for (const keyword of keywords) {
      const index = text.toLowerCase().indexOf(keyword.toLowerCase());
      if (index >= 0) {
        const startPos = index + keyword.length;
        let endPos = text.indexOf('.', startPos);
        if (endPos === -1 || endPos > startPos + maxLength) {
          endPos = startPos + maxLength;
        }
        
        const extracted = text.substring(startPos, endPos).trim();
        if (extracted && extracted.length > 0) {
          // Clean extracted text (remove punctuation etc.)
          return extracted.replace(/[：:,，;；]/g, '').trim();
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get feature description
   * @param feature Token feature
   */
  private getFeatureDescription(feature: TokenFeature): string {
    const descriptions: Record<TokenFeature, string> = {
      [TokenFeature.MINTABLE]: 'Mintable',
      [TokenFeature.BURNABLE]: 'Burnable',
      [TokenFeature.PAUSABLE]: 'Pausable',
      [TokenFeature.PERMIT]: 'Gasless Approvals',
      [TokenFeature.VOTES]: 'Voting Governance',
      [TokenFeature.SNAPSHOT]: 'Balance Snapshots',
      [TokenFeature.FLASH_MINTING]: 'Flash Loans',
      [TokenFeature.ANTI_BOT]: 'Anti-Bot Protection',
      [TokenFeature.LIQUIDITY_GENERATOR]: 'Liquidity Generation',
      [TokenFeature.TAX]: 'Transaction Tax',
      [TokenFeature.MAX_TRANSACTION]: 'Max Transaction Limit',
      [TokenFeature.MAX_WALLET]: 'Max Wallet Holdings',
      [TokenFeature.BLACKLIST]: 'Blacklist'
    };
    
    return descriptions[feature] || feature;
  }
  
  /**
   * Get risk level text description
   * @param level Risk level
   */
  private getRiskLevelText(level: 'low' | 'medium' | 'high'): string {
    const levelTexts = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High'
    };
    
    return levelTexts[level];
  }
} 