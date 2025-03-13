import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface WhitepaperInput {
  projectName: string;
  projectDescription: string;
  industry: string;
  targetAudience: string;
  problemStatement: string;
  solutionDescription: string;
  tokenomics?: any;
  roadmap?: any;
  team?: any;
}

interface TokenomicsInput {
  projectName: string;
  projectDescription: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  useCase: string;
  monetizationStrategy: string;
  initialDistribution?: any;
  vestingPeriods?: any;
  customParameters?: Record<string, any>;
}

interface SmartContractInput {
  contractType: string;
  blockchain: string;
  tokenName?: string;
  tokenSymbol?: string;
  totalSupply?: number;
  features: string[];
  customFunctions?: any[];
  securityLevel?: 'standard' | 'enhanced' | 'maximum';
  compliance?: string[];
  targetGas?: number;
}

interface SecurityAuditInput {
  contractCode: string;
  blockchain: string;
  contractType: string;
}

interface CodeAnalysisInput {
  code: string;
  language: string;
  optimization?: 'gas' | 'performance' | 'readability';
  securityCheck?: boolean;
}

/**
 * Generate whitepaper content using OpenAI
 */
export const generateWhitepaperContent = async (input: WhitepaperInput): Promise<string> => {
  try {
    const {
      projectName,
      projectDescription,
      industry,
      targetAudience,
      problemStatement,
      solutionDescription,
      tokenomics,
      roadmap,
      team,
    } = input;

    // Create a prompt for the AI
    const prompt = `
      Generate a comprehensive whitepaper for a blockchain project with the following details:
      
      Project Name: ${projectName}
      Project Description: ${projectDescription}
      Industry: ${industry}
      Target Audience: ${targetAudience}
      Problem Statement: ${problemStatement}
      Solution Description: ${solutionDescription}
      ${tokenomics ? `Tokenomics: ${JSON.stringify(tokenomics)}` : ''}
      ${roadmap ? `Roadmap: ${JSON.stringify(roadmap)}` : ''}
      ${team ? `Team: ${JSON.stringify(team)}` : ''}
      
      The whitepaper should include the following sections:
      1. Executive Summary
      2. Introduction
      3. Market Analysis
      4. Problem Statement
      5. Solution Overview
      6. Technology Architecture
      7. Token Economics
      8. Roadmap
      9. Team
      10. Conclusion
      
      Format the whitepaper in Markdown format.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert blockchain whitepaper writer with deep knowledge of cryptocurrency, tokenomics, and blockchain technology.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    // Extract and return the generated content
    return response.choices[0]?.message?.content || 'Failed to generate whitepaper content';
  } catch (error) {
    console.error('Error generating whitepaper content:', error);
    throw new Error('Failed to generate whitepaper content');
  }
};

/**
 * Generate tokenomics model using OpenAI
 */
export const generateTokenomics = async (input: TokenomicsInput): Promise<any> => {
  try {
    const {
      projectName,
      projectDescription,
      tokenName,
      tokenSymbol,
      totalSupply,
      useCase,
      monetizationStrategy,
      initialDistribution,
      vestingPeriods,
      customParameters
    } = input;

    // Create a prompt for the AI
    const prompt = `
      Generate a comprehensive tokenomics model for a blockchain project with the following details:
      
      Project Name: ${projectName}
      Project Description: ${projectDescription}
      Token Name: ${tokenName}
      Token Symbol: ${tokenSymbol}
      Total Supply: ${totalSupply}
      Use Case: ${useCase}
      Monetization Strategy: ${monetizationStrategy}
      ${initialDistribution ? `Initial Distribution: ${JSON.stringify(initialDistribution)}` : ''}
      ${vestingPeriods ? `Vesting Periods: ${JSON.stringify(vestingPeriods)}` : ''}
      ${customParameters ? `Custom Parameters: ${JSON.stringify(customParameters)}` : ''}
      
      The tokenomics model should include:
      1. Token Distribution (percentages for different stakeholders)
      2. Vesting Schedules
      3. Token Utility
      4. Value Capture Mechanisms
      5. Incentive Structures
      6. Governance Model
      7. Economic Simulations (basic)
      8. Market Stability Mechanisms
      9. Treasury Management
      10. Long-term Sustainability Plan
      
      Return the response as a structured JSON object.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert tokenomics designer with deep knowledge of cryptocurrency economics, game theory, and incentive mechanisms.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    // Extract and parse the generated content
    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating tokenomics model:', error);
    throw new Error('Failed to generate tokenomics model');
  }
};

/**
 * Generate smart contract code using OpenAI
 */
export const generateSmartContract = async (input: SmartContractInput): Promise<string> => {
  try {
    const {
      contractType,
      blockchain,
      tokenName,
      tokenSymbol,
      totalSupply,
      features,
      customFunctions,
      securityLevel = 'standard',
      compliance = [],
      targetGas
    } = input;

    // Prepare blockchain-specific templates and instructions
    const blockchainSpecifics = getBlockchainTemplates(blockchain, contractType);
    
    // Create a prompt for the AI
    const prompt = `
      Generate a secure, optimized smart contract with the following details:
      
      Contract Type: ${contractType}
      Blockchain: ${blockchain}
      ${tokenName ? `Token Name: ${tokenName}` : ''}
      ${tokenSymbol ? `Token Symbol: ${tokenSymbol}` : ''}
      ${totalSupply ? `Total Supply: ${totalSupply}` : ''}
      Features: ${JSON.stringify(features)}
      ${customFunctions ? `Custom Functions: ${JSON.stringify(customFunctions)}` : ''}
      Security Level: ${securityLevel}
      ${compliance.length > 0 ? `Compliance Requirements: ${JSON.stringify(compliance)}` : ''}
      ${targetGas ? `Target Gas: ${targetGas}` : ''}
      
      The smart contract should:
      1. Follow best security practices
      2. Be gas-optimized
      3. Include comprehensive comments
      4. Implement all specified features
      5. Include appropriate tests
      
      ${blockchainSpecifics.instructions}
      
      ${blockchainSpecifics.template ? `Use the following template as a starting point:\n\n${blockchainSpecifics.template}\n` : ''}
      
      Security considerations based on selected level (${securityLevel}):
      ${getSecurityRequirements(securityLevel)}
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert smart contract developer with deep knowledge of blockchain security, gas optimization, and best practices.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.2,
    });

    // Extract and return the generated content
    return response.choices[0]?.message?.content || 'Failed to generate smart contract code';
  } catch (error) {
    console.error('Error generating smart contract code:', error);
    throw new Error('Failed to generate smart contract code');
  }
};

/**
 * Get blockchain-specific templates and instructions
 */
const getBlockchainTemplates = (blockchain: string, contractType: string) => {
  const templates: Record<string, Record<string, any>> = {
    'Solana': {
      'SPL Token': {
        template: `
#[program]
pub mod token_program {
    use anchor_lang::prelude::*;
    use anchor_spl::token::{self, Mint, Token, TokenAccount};

    #[program]
    pub mod token_program {
        use super::*;

        pub fn initialize(ctx: Context<Initialize>, decimals: u8, name: String, symbol: String) -> Result<()> {
            // Implementation here
            Ok(())
        }
        
        pub fn mint_to(ctx: Context<MintTo>, amount: u64) -> Result<()> {
            // Implementation here
            Ok(())
        }
        
        pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
            // Implementation here
            Ok(())
        }
        
        pub fn burn(ctx: Context<Burn>, amount: u64) -> Result<()> {
            // Implementation here
            Ok(())
        }
    }

    #[derive(Accounts)]
    pub struct Initialize<'info> {
        // Account structures here
    }
    
    #[derive(Accounts)]
    pub struct MintTo<'info> {
        // Account structures here
    }
    
    #[derive(Accounts)]
    pub struct Transfer<'info> {
        // Account structures here
    }
    
    #[derive(Accounts)]
    pub struct Burn<'info> {
        // Account structures here
    }
}
        `,
        instructions: 'Use Rust with the Anchor framework for Solana. Ensure proper account validation and access control.',
      },
      'NFT': {
        template: `
#[program]
pub mod nft_program {
    use anchor_lang::prelude::*;
    use anchor_spl::token::{self, Mint, Token, TokenAccount};
    use mpl_token_metadata::instruction as metadata_instruction;

    #[program]
    pub mod nft_program {
        use super::*;

        pub fn mint_nft(
            ctx: Context<MintNFT>,
            name: String,
            symbol: String,
            uri: String,
        ) -> Result<()> {
            // Implementation here
            Ok(())
        }
        
        pub fn transfer_nft(ctx: Context<TransferNFT>) -> Result<()> {
            // Implementation here
            Ok(())
        }
        
        pub fn update_metadata(
            ctx: Context<UpdateMetadata>,
            new_uri: String,
        ) -> Result<()> {
            // Implementation here
            Ok(())
        }
    }

    #[derive(Accounts)]
    pub struct MintNFT<'info> {
        // Account structures here
    }
    
    #[derive(Accounts)]
    pub struct TransferNFT<'info> {
        // Account structures here
    }
    
    #[derive(Accounts)]
    pub struct UpdateMetadata<'info> {
        // Account structures here
    }
}
        `,
        instructions: 'Use Rust with the Anchor framework and Metaplex for Solana NFTs. Ensure proper metadata handling.',
      },
    },
    'Ethereum': {
      'ERC20': {
        template: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CustomToken is ERC20, Ownable, ReentrancyGuard {
    // Custom variables here
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }
    
    // Custom functions here
}
        `,
        instructions: 'Use Solidity with OpenZeppelin libraries for Ethereum ERC20 tokens. Ensure proper access controls and security checks.',
      },
      'ERC721': {
        template: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CustomNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Custom variables here
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        // Initialization code here
    }
    
    function mint(address recipient, string memory tokenURI) public returns (uint256) {
        // Minting implementation here
    }
    
    // Custom functions here
}
        `,
        instructions: 'Use Solidity with OpenZeppelin libraries for Ethereum ERC721 NFTs. Ensure proper metadata handling and access controls.',
      },
    },
  };

  // Get the template for the specified blockchain and contract type
  const blockchainTemplate = templates[blockchain]?.[contractType] || {
    template: '',
    instructions: `${blockchain === 'Solana' ? 'Use Rust with the Anchor framework.' : 'Use Solidity with the latest stable version.'}`
  };

  return blockchainTemplate;
};

/**
 * Get security requirements based on security level
 */
const getSecurityRequirements = (securityLevel: string): string => {
  const securityRequirements: Record<string, string> = {
    'standard': `
      - Input validation for all public functions
      - Access control checks
      - Event emissions for state changes
      - Basic protection against common vulnerabilities
    `,
    'enhanced': `
      - Comprehensive input validation with error messages
      - Role-based access control system
      - Detailed event emissions with indexed parameters
      - Protection against reentrancy attacks
      - Integer overflow/underflow protection
      - Pausable functionality for emergency situations
      - Time-lock mechanisms for sensitive operations
    `,
    'maximum': `
      - Formal verification ready code
      - Multi-signature authorization for critical functions
      - Circuit breaker pattern implementation
      - Rate limiting mechanisms
      - Upgradeability with proper governance
      - Comprehensive test coverage
      - Full audit readiness with detailed comments
      - Defense-in-depth approach for all vulnerabilities
      - Sandboxing for external calls
    `,
  };

  return securityRequirements[securityLevel] || securityRequirements['standard'];
};

/**
 * Perform security audit on smart contract code
 */
export const auditSmartContract = async (input: SecurityAuditInput): Promise<any> => {
  try {
    const { contractCode, blockchain, contractType } = input;

    // Create a prompt for the AI
    const prompt = `
      Perform a comprehensive security audit on the following ${blockchain} smart contract (${contractType}):
      
      \`\`\`
      ${contractCode}
      \`\`\`
      
      Analyze the code for:
      1. Common security vulnerabilities
      2. Best practice violations
      3. Logic errors
      4. Gas optimization opportunities
      5. Code quality issues
      
      For each issue found, provide:
      - Severity level (Critical, High, Medium, Low, Informational)
      - Description of the issue
      - Location in the code
      - Recommended fix
      
      Also provide an overall risk assessment and summary of findings.
      Return the response as a structured JSON object.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert smart contract security auditor with deep knowledge of blockchain security, common vulnerabilities, and best practices.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    // Extract and parse the generated content
    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error performing security audit:', error);
    throw new Error('Failed to perform security audit');
  }
};

/**
 * Analyze and optimize code
 */
export const analyzeCode = async (input: CodeAnalysisInput): Promise<any> => {
  try {
    const { code, language, optimization = 'performance', securityCheck = true } = input;

    // Create a prompt for the AI
    const prompt = `
      Analyze and optimize the following code written in ${language}:
      
      \`\`\`
      ${code}
      \`\`\`
      
      Optimization focus: ${optimization}
      ${securityCheck ? 'Include security analysis' : ''}
      
      Provide the following:
      1. Code quality assessment
      2. Optimization suggestions with examples
      ${securityCheck ? '3. Security vulnerabilities and fixes' : ''}
      4. Refactoring recommendations
      5. Best practice alignment
      
      ${optimization === 'gas' ? 'Focus on reducing gas costs and computational complexity.' : ''}
      ${optimization === 'performance' ? 'Focus on improving execution speed and reducing resource usage.' : ''}
      ${optimization === 'readability' ? 'Focus on improving code readability and maintainability.' : ''}
      
      Return the analysis as a structured JSON object.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert ${language} developer with deep knowledge of code optimization, security, and best practices.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    // Extract and parse the generated content
    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing code:', error);
    throw new Error('Failed to analyze code');
  }
};

/**
 * Generate contract test cases
 */
export const generateContractTests = async (input: { contractCode: string; blockchain: string; testingFramework?: string }): Promise<string> => {
  try {
    const { contractCode, blockchain, testingFramework } = input;
    
    const frameworksMap: Record<string, Record<string, string>> = {
      'Solana': {
        'default': 'anchor-mocha',
        'anchor-mocha': 'Anchor with Mocha',
        'jest': 'Jest with ts-jest'
      },
      'Ethereum': {
        'default': 'hardhat',
        'hardhat': 'Hardhat with Ethers.js',
        'truffle': 'Truffle',
        'foundry': 'Foundry'
      }
    };
    
    const framework = testingFramework || frameworksMap[blockchain]?.['default'] || 'default';
    const frameworkName = frameworksMap[blockchain]?.[framework] || framework;

    // Create a prompt for the AI
    const prompt = `
      Generate comprehensive test cases for the following ${blockchain} smart contract using ${frameworkName}:
      
      \`\`\`
      ${contractCode}
      \`\`\`
      
      The test suite should include:
      1. Unit tests for individual functions
      2. Integration tests for function interactions
      3. Edge case handling tests
      4. Failure case tests
      5. Security-focused tests
      
      Include setup, teardown, and proper isolation between tests.
      Make the tests comprehensive yet readable with clear comments explaining each test's purpose.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert ${blockchain} developer specializing in smart contract testing. You write clean, thorough, and effective tests.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.2,
    });

    // Extract and return the generated content
    return response.choices[0]?.message?.content || 'Failed to generate contract tests';
  } catch (error) {
    console.error('Error generating contract tests:', error);
    throw new Error('Failed to generate contract tests');
  }
}; 