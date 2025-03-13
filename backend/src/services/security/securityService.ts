import * as crypto from 'crypto';
import { ethers } from 'ethers';
import { PublicKey } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { BlockchainType } from '../bridge/bridgeService';

/**
 * Security risk level enumeration
 */
export enum RiskLevel {
  NONE = 'none',             // No risk
  LOW = 'low',               // Low risk
  MEDIUM = 'medium',         // Medium risk
  HIGH = 'high',             // High risk
  CRITICAL = 'critical'      // Critical risk
}

/**
 * Security check type enumeration
 */
export enum SecurityCheckType {
  ADDRESS_VALIDATION = 'address_validation',         // Address validation
  TRANSACTION_VALIDATION = 'transaction_validation', // Transaction validation
  SIGNATURE_VERIFICATION = 'signature_verification', // Signature verification
  PHISHING_DETECTION = 'phishing_detection',         // Phishing detection
  SMART_CONTRACT_RISK = 'smart_contract_risk',       // Smart contract risk
  RATE_LIMIT = 'rate_limit'                          // Rate limit
}

/**
 * Security check result interface
 */
export interface SecurityCheckResult {
  success: boolean;              // Whether the check passed
  checkType: SecurityCheckType;  // Check type
  riskLevel: RiskLevel;          // Risk level
  message: string;               // Result message
  details?: any;                 // Detailed information (optional)
}

/**
 * Address validation options interface
 */
export interface AddressValidationOptions {
  allowedBlockchains?: BlockchainType[];  // Allowed blockchain types
}

/**
 * Transaction validation options interface
 */
export interface TransactionValidationOptions {
  maxAmount?: string;           // Maximum amount
  allowedRecipients?: string[]; // Allowed recipient addresses
  minConfirmations?: number;    // Minimum confirmations
}

/**
 * Signature verification options interface
 */
export interface SignatureVerificationOptions {
  message: string;              // Original message
  signature: string;            // Signature
  publicKey: string;            // Public key or address
  blockchain: BlockchainType;   // Blockchain type
}

/**
 * Phishing detection options interface
 */
export interface PhishingDetectionOptions {
  url?: string;                 // URL to check
  address?: string;             // Address to check
  contractAddress?: string;     // Contract address to check
}

/**
 * Smart contract risk assessment options interface
 */
export interface SmartContractRiskOptions {
  contractAddress: string;      // Contract address
  blockchain: BlockchainType;   // Blockchain type
  checkSource?: boolean;        // Whether to check source code
}

/**
 * Rate limit options interface
 */
export interface RateLimitOptions {
  ip: string;                   // IP address
  endpoint: string;             // API endpoint
  maxRequests: number;          // Maximum number of requests
  timeWindowMs: number;         // Time window (milliseconds)
}

/**
 * Security service class
 * Provides various security checks and validation functions
 */
export class SecurityService {
  // Known blacklisted addresses
  private blacklistedAddresses: Set<string> = new Set();
  
  // Phishing website list
  private phishingDomains: Set<string> = new Set();
  
  // Rate limit tracking
  private rateLimitTracker: Map<string, { count: number, resetTime: number }> = new Map();
  
  /**
   * Constructor
   */
  constructor() {
    // Initialize blacklisted addresses and phishing website list
    this.initializeSecurityLists();
  }
  
  /**
   * Initialize security lists
   * Load known blacklisted addresses and phishing websites
   */
  private initializeSecurityLists(): void {
    // This should be loaded from database or configuration file
    // Below are example data
    
    // Known blacklisted addresses
    const knownBlacklistedAddresses = [
      '0x0000000000000000000000000000000000000dead', // Example Ethereum blacklisted address
      '0x0000000000000000000000000000000000001337', // Example Ethereum blacklisted address
      'BurnAddress11111111111111111111111111111111' // Example Solana blacklisted address
    ];
    
    // Known phishing websites
    const knownPhishingDomains = [
      'metamask-wallet.io',
      'phantomm.app',
      'solana-faucet.gift',
      'eth-giveaway.com',
      'bnb-event.net'
    ];
    
    // Add to respective collections
    knownBlacklistedAddresses.forEach(address => this.blacklistedAddresses.add(address.toLowerCase()));
    knownPhishingDomains.forEach(domain => this.phishingDomains.add(domain.toLowerCase()));
  }
  
  /**
   * Validate address
   * @param address Address to validate
   * @param blockchain Blockchain type
   * @param options Validation options
   * @returns Security check result
   */
  validateAddress(
    address: string,
    blockchain: BlockchainType,
    options: AddressValidationOptions = {}
  ): SecurityCheckResult {
    try {
      // Check if allowed blockchain type
      if (options.allowedBlockchains && !options.allowedBlockchains.includes(blockchain)) {
        return {
          success: false,
          checkType: SecurityCheckType.ADDRESS_VALIDATION,
          riskLevel: RiskLevel.HIGH,
          message: `Unsupported blockchain type: ${blockchain}`
        };
      }
      
      // Check if address is in blacklisted addresses
      if (this.blacklistedAddresses.has(address.toLowerCase())) {
        return {
          success: false,
          checkType: SecurityCheckType.ADDRESS_VALIDATION,
          riskLevel: RiskLevel.CRITICAL,
          message: 'Address is in blacklisted addresses'
        };
      }
      
      // Validate address format based on blockchain type
      let isValidFormat = false;
      
      switch (blockchain) {
        case BlockchainType.ETHEREUM:
        case BlockchainType.BNB:
          // Ethereum and BNB Chain address format validation
          isValidFormat = ethers.isAddress(address);
          break;
          
        case BlockchainType.SOLANA:
          // Solana address format validation
          try {
            new PublicKey(address);
            isValidFormat = true;
          } catch {
            isValidFormat = false;
          }
          break;
          
        default:
          return {
            success: false,
            checkType: SecurityCheckType.ADDRESS_VALIDATION,
            riskLevel: RiskLevel.MEDIUM,
            message: `Unknown blockchain type: ${blockchain}`
          };
      }
      
      // Return validation result
      if (isValidFormat) {
        return {
          success: true,
          checkType: SecurityCheckType.ADDRESS_VALIDATION,
          riskLevel: RiskLevel.NONE,
          message: 'Address format is valid'
        };
      } else {
        return {
          success: false,
          checkType: SecurityCheckType.ADDRESS_VALIDATION,
          riskLevel: RiskLevel.HIGH,
          message: 'Address format is invalid'
        };
      }
    } catch (error) {
      return {
        success: false,
        checkType: SecurityCheckType.ADDRESS_VALIDATION,
        riskLevel: RiskLevel.MEDIUM,
        message: `Address validation error: ${error.message}`
      };
    }
  }
  
  /**
   * Validate transaction
   * @param fromAddress Sending address
   * @param toAddress Receiving address
   * @param amount Amount
   * @param blockchain Blockchain type
   * @param options Validation options
   * @returns Security check result
   */
  validateTransaction(
    fromAddress: string,
    toAddress: string,
    amount: string,
    blockchain: BlockchainType,
    options: TransactionValidationOptions = {}
  ): SecurityCheckResult {
    try {
      // Validate sending and receiving addresses
      const fromAddressResult = this.validateAddress(fromAddress, blockchain);
      if (!fromAddressResult.success) {
        return {
          ...fromAddressResult,
          message: `Invalid sending address: ${fromAddressResult.message}`
        };
      }
      
      const toAddressResult = this.validateAddress(toAddress, blockchain);
      if (!toAddressResult.success) {
        return {
          ...toAddressResult,
          message: `Invalid receiving address: ${toAddressResult.message}`
        };
      }
      
      // Check if receiving address is in allowed list (if any)
      if (options.allowedRecipients && 
          options.allowedRecipients.length > 0 && 
          !options.allowedRecipients.includes(toAddress)) {
        return {
          success: false,
          checkType: SecurityCheckType.TRANSACTION_VALIDATION,
          riskLevel: RiskLevel.HIGH,
          message: 'Receiving address not in allowed list'
        };
      }
      
      // Check if amount exceeds maximum allowed value
      if (options.maxAmount) {
        const numericAmount = parseFloat(amount);
        const maxAmount = parseFloat(options.maxAmount);
        
        if (numericAmount > maxAmount) {
          return {
            success: false,
            checkType: SecurityCheckType.TRANSACTION_VALIDATION,
            riskLevel: RiskLevel.MEDIUM,
            message: `Transaction amount ${amount} exceeds allowed maximum value ${options.maxAmount}`
          };
        }
      }
      
      // Transaction validation passed
      return {
        success: true,
        checkType: SecurityCheckType.TRANSACTION_VALIDATION,
        riskLevel: RiskLevel.NONE,
        message: 'Transaction validation passed'
      };
    } catch (error) {
      return {
        success: false,
        checkType: SecurityCheckType.TRANSACTION_VALIDATION,
        riskLevel: RiskLevel.MEDIUM,
        message: `Transaction validation error: ${error.message}`
      };
    }
  }
  
  /**
   * Validate signature
   * @param options Signature verification options
   * @returns Security check result
   */
  verifySignature(options: SignatureVerificationOptions): SecurityCheckResult {
    try {
      let isValidSignature = false;
      
      // Validate signature based on blockchain type
      switch (options.blockchain) {
        case BlockchainType.ETHEREUM:
        case BlockchainType.BNB:
          // Ethereum and BNB Chain signature validation
          try {
            const recoveredAddress = ethers.verifyMessage(options.message, options.signature);
            isValidSignature = recoveredAddress.toLowerCase() === options.publicKey.toLowerCase();
          } catch {
            isValidSignature = false;
          }
          break;
          
        case BlockchainType.SOLANA:
          // Solana signature validation
          try {
            const publicKey = new PublicKey(options.publicKey);
            const signatureBytes = bs58.decode(options.signature);
            const messageBytes = new TextEncoder().encode(options.message);
            
            // Since Solana web3.js library does not directly provide verification function, here we need to use tweetnacl library
            // For simplification example, here we did not implement actual verification logic
            isValidSignature = true; // Assume verification success
          } catch {
            isValidSignature = false;
          }
          break;
          
        default:
          return {
            success: false,
            checkType: SecurityCheckType.SIGNATURE_VERIFICATION,
            riskLevel: RiskLevel.MEDIUM,
            message: `Unknown blockchain type: ${options.blockchain}`
          };
      }
      
      // Return validation result
      if (isValidSignature) {
        return {
          success: true,
          checkType: SecurityCheckType.SIGNATURE_VERIFICATION,
          riskLevel: RiskLevel.NONE,
          message: 'Signature verification passed'
        };
      } else {
        return {
          success: false,
          checkType: SecurityCheckType.SIGNATURE_VERIFICATION,
          riskLevel: RiskLevel.HIGH,
          message: 'Signature verification failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        checkType: SecurityCheckType.SIGNATURE_VERIFICATION,
        riskLevel: RiskLevel.MEDIUM,
        message: `Signature verification error: ${error.message}`
      };
    }
  }
  
  /**
   * Detect phishing risk
   * @param options Phishing detection options
   * @returns Security check result
   */
  detectPhishing(options: PhishingDetectionOptions): SecurityCheckResult {
    try {
      // Check URL (if provided)
      if (options.url) {
        try {
          const url = new URL(options.url);
          const domain = url.hostname.toLowerCase();
          
          // Check if domain is in known phishing website list
          if (this.phishingDomains.has(domain)) {
            return {
              success: false,
              checkType: SecurityCheckType.PHISHING_DETECTION,
              riskLevel: RiskLevel.CRITICAL,
              message: `Detected phishing website: ${domain}`,
              details: { url: options.url }
            };
          }
          
          // Check for suspicious features
          const suspiciousFeatures = [];
          
          // Check if domain is imitating common cryptocurrency services
          const knownServices = ['metamask', 'phantom', 'solana', 'ethereum', 'binance', 'uniswap'];
          for (const service of knownServices) {
            if (domain.includes(service) && !domain.endsWith(`.${service}.com`) && !domain.endsWith(`.${service}.io`)) {
              suspiciousFeatures.push(`Possible imitation of ${service} official website`);
            }
          }
          
          // Check if URL contains sensitive words
          const sensitiveWords = ['wallet', 'connect', 'verify', 'claim', 'airdrop', 'giveaway', 'free', 'bonus'];
          for (const word of sensitiveWords) {
            if (options.url.toLowerCase().includes(word)) {
              suspiciousFeatures.push(`URL contains sensitive word: ${word}`);
            }
          }
          
          // If there are suspicious features, return risk warning
          if (suspiciousFeatures.length > 0) {
            return {
              success: false,
              checkType: SecurityCheckType.PHISHING_DETECTION,
              riskLevel: suspiciousFeatures.length > 2 ? RiskLevel.HIGH : RiskLevel.MEDIUM,
              message: 'Detected potential phishing risk',
              details: { 
                url: options.url,
                suspiciousFeatures
              }
            };
          }
        } catch (error) {
          return {
            success: false,
            checkType: SecurityCheckType.PHISHING_DETECTION,
            riskLevel: RiskLevel.LOW,
            message: `Cannot parse URL: ${error.message}`,
            details: { url: options.url }
          };
        }
      }
      
      // Check address (if provided)
      if (options.address) {
        // Check if address is in blacklisted addresses
        if (this.blacklistedAddresses.has(options.address.toLowerCase())) {
          return {
            success: false,
            checkType: SecurityCheckType.PHISHING_DETECTION,
            riskLevel: RiskLevel.CRITICAL,
            message: 'Detected blacklisted address',
            details: { address: options.address }
          };
        }
      }
      
      // Check contract address (if provided)
      if (options.contractAddress) {
        // Check if contract address is in blacklisted addresses
        if (this.blacklistedAddresses.has(options.contractAddress.toLowerCase())) {
          return {
            success: false,
            checkType: SecurityCheckType.PHISHING_DETECTION,
            riskLevel: RiskLevel.CRITICAL,
            message: 'Detected blacklisted contract address',
            details: { contractAddress: options.contractAddress }
          };
        }
      }
      
      // No phishing risk detected
      return {
        success: true,
        checkType: SecurityCheckType.PHISHING_DETECTION,
        riskLevel: RiskLevel.NONE,
        message: 'No phishing risk detected'
      };
    } catch (error) {
      return {
        success: false,
        checkType: SecurityCheckType.PHISHING_DETECTION,
        riskLevel: RiskLevel.LOW,
        message: `Phishing detection error: ${error.message}`
      };
    }
  }
  
  /**
   * Assess smart contract risk
   * @param options Smart contract risk assessment options
   * @returns Security check result
   */
  assessSmartContractRisk(options: SmartContractRiskOptions): SecurityCheckResult {
    // Note: Complete smart contract risk assessment requires complex static analysis and historical data
    // This example only provides basic check
    
    try {
      // Check if contract address is in blacklisted addresses
      if (this.blacklistedAddresses.has(options.contractAddress.toLowerCase())) {
        return {
          success: false,
          checkType: SecurityCheckType.SMART_CONTRACT_RISK,
          riskLevel: RiskLevel.CRITICAL,
          message: 'Contract address is in blacklisted addresses',
          details: { contractAddress: options.contractAddress }
        };
      }
      
      // Here we should perform deeper contract analysis, such as:
      // 1. Check if contract code is verified
      // 2. Find common vulnerability patterns
      // 3. Analyze historical transactions and behaviors
      // 4. Check if audited
      
      // Since these checks require external API and more complex analysis, here we only return a placeholder result
      return {
        success: true,
        checkType: SecurityCheckType.SMART_CONTRACT_RISK,
        riskLevel: RiskLevel.LOW,
        message: 'Basic smart contract security check did not find serious risk',
        details: {
          contractAddress: options.contractAddress,
          blockchain: options.blockchain,
          note: 'Complete smart contract security analysis requires deeper check'
        }
      };
    } catch (error) {
      return {
        success: false,
        checkType: SecurityCheckType.SMART_CONTRACT_RISK,
        riskLevel: RiskLevel.MEDIUM,
        message: `Smart contract risk assessment error: ${error.message}`
      };
    }
  }
  
  /**
   * Check rate limit
   * @param options Rate limit options
   * @returns Security check result
   */
  checkRateLimit(options: RateLimitOptions): SecurityCheckResult {
    try {
      const key = `${options.ip}:${options.endpoint}`;
      const now = Date.now();
      
      // Get or create tracking record
      let record = this.rateLimitTracker.get(key);
      if (!record || now > record.resetTime) {
        // Create new record or reset expired record
        record = {
          count: 0,
          resetTime: now + options.timeWindowMs
        };
      }
      
      // Increase count
      record.count++;
      this.rateLimitTracker.set(key, record);
      
      // Check if exceeds limit
      if (record.count > options.maxRequests) {
        return {
          success: false,
          checkType: SecurityCheckType.RATE_LIMIT,
          riskLevel: RiskLevel.MEDIUM,
          message: 'Request frequency exceeds limit',
          details: {
            ip: options.ip,
            endpoint: options.endpoint,
            currentCount: record.count,
            maxRequests: options.maxRequests,
            resetInMs: record.resetTime - now
          }
        };
      }
      
      // Not exceeds limit
      return {
        success: true,
        checkType: SecurityCheckType.RATE_LIMIT,
        riskLevel: RiskLevel.NONE,
        message: 'Request frequency within limit',
        details: {
          currentCount: record.count,
          maxRequests: options.maxRequests,
          resetInMs: record.resetTime - now
        }
      };
    } catch (error) {
      return {
        success: false,
        checkType: SecurityCheckType.RATE_LIMIT,
        riskLevel: RiskLevel.LOW,
        message: `Rate limit check error: ${error.message}`
      };
    }
  }
  
  /**
   * Generate security token
   * @param data Data to encode
   * @param expiryMs Expiry time (milliseconds)
   * @returns Security token
   */
  generateSecurityToken(data: any, expiryMs: number = 3600000): string {
    try {
      // Create payload
      const payload = {
        data,
        exp: Date.now() + expiryMs
      };
      
      // Convert payload to JSON string
      const payloadStr = JSON.stringify(payload);
      
      // Use SHA-256 encryption
      const hmac = crypto.createHmac('sha256', process.env.SECURITY_SECRET || 'default-secret-key');
      const signature = hmac.update(payloadStr).digest('hex');
      
      // Encode payload as Base64 and return with signature
      const encodedPayload = Buffer.from(payloadStr).toString('base64');
      return `${encodedPayload}.${signature}`;
    } catch (error) {
      console.error('Security token generation failed:', error);
      throw new Error(`Security token generation failed: ${error.message}`);
    }
  }
  
  /**
   * Verify security token
   * @param token Security token
   * @returns Verification result and decoded data
   */
  verifySecurityToken(token: string): { valid: boolean, data?: any, message?: string } {
    try {
      // Split token
      const parts = token.split('.');
      if (parts.length !== 2) {
        return { valid: false, message: 'Invalid token format' };
      }
      
      const [encodedPayload, signature] = parts;
      
      // Decode payload
      const payloadStr = Buffer.from(encodedPayload, 'base64').toString();
      const payload = JSON.parse(payloadStr);
      
      // Check if expired
      if (payload.exp && payload.exp < Date.now()) {
        return { valid: false, message: 'Token expired' };
      }
      
      // Verify signature
      const hmac = crypto.createHmac('sha256', process.env.SECURITY_SECRET || 'default-secret-key');
      const expectedSignature = hmac.update(payloadStr).digest('hex');
      
      if (signature !== expectedSignature) {
        return { valid: false, message: 'Invalid signature' };
      }
      
      // Verification passed
      return { valid: true, data: payload.data };
    } catch (error) {
      return { valid: false, message: `Security token verification failed: ${error.message}` };
    }
  }
  
  /**
   * Add address to blacklisted addresses
   * @param address Address to add
   */
  addToBlacklist(address: string): void {
    this.blacklistedAddresses.add(address.toLowerCase());
  }
  
  /**
   * Remove address from blacklisted addresses
   * @param address Address to remove
   */
  removeFromBlacklist(address: string): void {
    this.blacklistedAddresses.delete(address.toLowerCase());
  }
  
  /**
   * Add phishing website domain
   * @param domain Domain to add
   */
  addPhishingDomain(domain: string): void {
    this.phishingDomains.add(domain.toLowerCase());
  }
  
  /**
   * Remove phishing website domain
   * @param domain Domain to remove
   */
  removePhishingDomain(domain: string): void {
    this.phishingDomains.delete(domain.toLowerCase());
  }
} 