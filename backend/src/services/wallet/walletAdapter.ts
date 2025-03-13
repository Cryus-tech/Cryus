import { ethers } from 'ethers';
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  VersionedTransaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import * as bs58 from 'bs58';
import { BlockchainType } from '../bridge/bridgeService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Wallet Adapter Base Interface
 * Defines the basic functionality that all wallet adapters must implement
 */
export interface WalletAdapter {
  /**
   * Get wallet address
   */
  getAddress(): string | Promise<string>;
  
  /**
   * Connect wallet
   */
  connect(): Promise<string>;
  
  /**
   * Disconnect wallet
   */
  disconnect(): Promise<void>;
  
  /**
   * Sign transaction
   * @param transaction Transaction to be signed
   */
  signTransaction(transaction: any): Promise<any>;
  
  /**
   * Sign message
   * @param message Message to be signed
   */
  signMessage(message: string): Promise<string>;
  
  /**
   * Get wallet connection status
   */
  isConnected(): boolean;
  
  /**
   * Get blockchain type of the wallet
   */
  getBlockchainType(): BlockchainType;
}

/**
 * Ethereum Wallet Adapter Abstract Class
 * Implements basic functionality for Ethereum wallets
 */
export abstract class EthereumWalletAdapterBase implements WalletAdapter {
  protected address: string | null = null;
  protected connected: boolean = false;
  
  abstract connect(): Promise<string>;
  abstract disconnect(): Promise<void>;
  abstract signTransaction(transaction: ethers.Transaction): Promise<ethers.Transaction>;
  abstract signMessage(message: string): Promise<string>;
  
  /**
   * Get wallet address
   */
  getAddress(): string {
    if (!this.address) {
      throw new Error('Wallet not connected');
    }
    return this.address;
  }
  
  /**
   * Check wallet connection status
   */
  isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Get blockchain type
   */
  getBlockchainType(): BlockchainType {
    return BlockchainType.ETHEREUM;
  }
}

/**
 * Solana Wallet Adapter Abstract Class
 * Implements basic functionality for Solana wallets
 */
export abstract class SolanaWalletAdapterBase implements WalletAdapter {
  protected address: string | null = null;
  protected connected: boolean = false;
  
  abstract connect(): Promise<string>;
  abstract disconnect(): Promise<void>;
  abstract signTransaction(transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction>;
  abstract signMessage(message: string): Promise<string>;
  
  /**
   * Get wallet address
   */
  getAddress(): string {
    if (!this.address) {
      throw new Error('Wallet not connected');
    }
    return this.address;
  }
  
  /**
   * Check wallet connection status
   */
  isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Get blockchain type
   */
  getBlockchainType(): BlockchainType {
    return BlockchainType.SOLANA;
  }
}

/**
 * Metamask Wallet Adapter
 * Implements connection to Ethereum network through Metamask
 */
export class MetamaskAdapter extends EthereumWalletAdapterBase {
  // Web3 instance (used in browser environment)
  private web3Provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  
  /**
   * Connect Metamask wallet
   */
  async connect(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Metamask not available, please install Metamask plugin');
    }
    
    try {
      // Request account access permission
      this.web3Provider = new ethers.BrowserProvider(window.ethereum);
      await this.web3Provider.send('eth_requestAccounts', []);
      
      // Get signer
      this.signer = await this.web3Provider.getSigner();
      this.address = await this.signer.getAddress();
      this.connected = true;
      
      console.log(`Connected to Metamask wallet: ${this.address}`);
      return this.address;
    } catch (error) {
      console.error('Connection to Metamask failed:', error);
      throw new Error(`Connection to Metamask failed: ${error.message}`);
    }
  }
  
  /**
   * Disconnect Metamask wallet
   */
  async disconnect(): Promise<void> {
    this.web3Provider = null;
    this.signer = null;
    this.address = null;
    this.connected = false;
    console.log('Disconnected from Metamask wallet');
  }
  
  /**
   * Use Metamask to sign transaction
   * @param transaction Transaction to be signed
   */
  async signTransaction(transaction: ethers.Transaction): Promise<ethers.Transaction> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signedTx = await this.signer.signTransaction(transaction);
      return signedTx;
    } catch (error) {
      console.error('Sign transaction failed:', error);
      throw new Error(`Sign transaction failed: ${error.message}`);
    }
  }
  
  /**
   * Use Metamask to sign message
   * @param message Message to be signed
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Sign message failed:', error);
      throw new Error(`Sign message failed: ${error.message}`);
    }
  }
}

/**
 * Solana Phantom Wallet Adapter
 * Implements connection to Solana network through Phantom
 */
export class PhantomAdapter extends SolanaWalletAdapterBase {
  private phantom: any = null;
  
  /**
   * Connect Phantom wallet
   */
  async connect(): Promise<string> {
    if (typeof window === 'undefined' || !window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not available, please install Phantom plugin');
    }
    
    try {
      this.phantom = window.solana;
      
      // Connect wallet
      const response = await this.phantom.connect();
      this.address = response.publicKey.toString();
      this.connected = true;
      
      console.log(`Connected to Phantom wallet: ${this.address}`);
      return this.address;
    } catch (error) {
      console.error('Connection to Phantom failed:', error);
      throw new Error(`Connection to Phantom failed: ${error.message}`);
    }
  }
  
  /**
   * Disconnect Phantom wallet
   */
  async disconnect(): Promise<void> {
    if (this.phantom) {
      await this.phantom.disconnect();
      this.phantom = null;
      this.address = null;
      this.connected = false;
      console.log('Disconnected from Phantom wallet');
    }
  }
  
  /**
   * Use Phantom to sign transaction
   * @param transaction Transaction to be signed
   */
  async signTransaction(transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction> {
    if (!this.phantom || !this.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signedTx = await this.phantom.signTransaction(transaction);
      return signedTx;
    } catch (error) {
      console.error('Sign transaction failed:', error);
      throw new Error(`Sign transaction failed: ${error.message}`);
    }
  }
  
  /**
   * Use Phantom to sign message
   * @param message Message to be signed
   */
  async signMessage(message: string): Promise<string> {
    if (!this.phantom || !this.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Convert message to Uint8Array
      const messageBytes = new TextEncoder().encode(message);
      
      // Sign message
      const { signature } = await this.phantom.signMessage(messageBytes, 'utf8');
      
      // Return base58 encoded signature
      return bs58.encode(signature);
    } catch (error) {
      console.error('Sign message failed:', error);
      throw new Error(`Sign message failed: ${error.message}`);
    }
  }
}

/**
 * Local Wallet Adapter
 * Used for backend service, sign transactions directly with private key
 */
export class LocalWalletAdapter implements WalletAdapter {
  private privateKey: string;
  private blockchainType: BlockchainType;
  private ethersWallet: ethers.Wallet | null = null;
  private solanaKeypair: Keypair | null = null;
  private connection: Connection | null = null;
  
  /**
   * Constructor
   * @param privateKey Private key
   * @param blockchainType Blockchain type
   * @param rpcUrl RPC URL (Solana)
   */
  constructor(privateKey: string, blockchainType: BlockchainType, rpcUrl?: string) {
    this.privateKey = privateKey;
    this.blockchainType = blockchainType;
    
    if (blockchainType === BlockchainType.ETHEREUM) {
      this.ethersWallet = new ethers.Wallet(privateKey);
    } else if (blockchainType === BlockchainType.SOLANA) {
      // Convert Base58 format private key to Uint8Array
      const privateKeyBytes = bs58.decode(privateKey);
      this.solanaKeypair = Keypair.fromSecretKey(privateKeyBytes);
      
      // If an RPC URL is provided, create connection
      if (rpcUrl) {
        this.connection = new Connection(rpcUrl, 'confirmed');
      }
    } else {
      throw new Error(`Unsupported blockchain type: ${blockchainType}`);
    }
  }
  
  /**
   * Get wallet address
   */
  getAddress(): string {
    if (this.blockchainType === BlockchainType.ETHEREUM && this.ethersWallet) {
      return this.ethersWallet.address;
    } else if (this.blockchainType === BlockchainType.SOLANA && this.solanaKeypair) {
      return this.solanaKeypair.publicKey.toString();
    }
    
    throw new Error('Wallet not initialized');
  }
  
  /**
   * Connect local wallet (return address immediately)
   */
  async connect(): Promise<string> {
    return this.getAddress();
  }
  
  /**
   * Disconnect local wallet connection (no actual operation)
   */
  async disconnect(): Promise<void> {
    // Local wallet does not need to disconnect
    return;
  }
  
  /**
   * Sign transaction
   * @param transaction Transaction to be signed
   */
  async signTransaction(transaction: any): Promise<any> {
    if (this.blockchainType === BlockchainType.ETHEREUM && this.ethersWallet) {
      return await this.ethersWallet.signTransaction(transaction);
    } else if (this.blockchainType === BlockchainType.SOLANA && this.solanaKeypair) {
      if (transaction instanceof Transaction) {
        return transaction.sign([this.solanaKeypair]);
      } else if ('sign' in transaction) {
        // Handle VersionedTransaction
        return transaction.sign([this.solanaKeypair]);
      }
    }
    
    throw new Error(`Unsupported transaction type or wallet not initialized`);
  }
  
  /**
   * Sign and send transaction (only supported for Solana)
   * @param transaction Transaction to be signed
   * @param rpcUrl RPC URL (if not provided in constructor)
   */
  async signAndSendTransaction(transaction: Transaction, rpcUrl?: string): Promise<string> {
    if (this.blockchainType !== BlockchainType.SOLANA || !this.solanaKeypair) {
      throw new Error('This method only supports Solana wallet');
    }
    
    let connection = this.connection;
    if (!connection && rpcUrl) {
      connection = new Connection(rpcUrl, 'confirmed');
    }
    
    if (!connection) {
      throw new Error('Solana connection not provided');
    }
    
    try {
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [this.solanaKeypair]
      );
      
      return signature;
    } catch (error) {
      console.error('Transaction sending failed:', error);
      throw new Error(`Transaction sending failed: ${error.message}`);
    }
  }
  
  /**
   * Sign message
   * @param message Message to be signed
   */
  async signMessage(message: string): Promise<string> {
    if (this.blockchainType === BlockchainType.ETHEREUM && this.ethersWallet) {
      return await this.ethersWallet.signMessage(message);
    } else if (this.blockchainType === BlockchainType.SOLANA && this.solanaKeypair) {
      const messageBytes = new TextEncoder().encode(message);
      const signature = this.solanaKeypair.sign(messageBytes).signature;
      return bs58.encode(signature);
    }
    
    throw new Error('Wallet not initialized');
  }
  
  /**
   * Check wallet connection status
   */
  isConnected(): boolean {
    return (
      (this.blockchainType === BlockchainType.ETHEREUM && this.ethersWallet !== null) ||
      (this.blockchainType === BlockchainType.SOLANA && this.solanaKeypair !== null)
    );
  }
  
  /**
   * Get blockchain type
   */
  getBlockchainType(): BlockchainType {
    return this.blockchainType;
  }
}

/**
 * Wallet Connection Factory
 * Used to create different types of wallet adapters
 */
export class WalletAdapterFactory {
  /**
   * Create browser wallet adapter
   * @param type Wallet type
   */
  static createBrowserWallet(type: 'metamask' | 'phantom'): WalletAdapter {
    switch (type) {
      case 'metamask':
        return new MetamaskAdapter();
      case 'phantom':
        return new PhantomAdapter();
      default:
        throw new Error(`Unsupported wallet type: ${type}`);
    }
  }
  
  /**
   * Create local wallet adapter
   * @param privateKey Private key
   * @param blockchainType Blockchain type
   * @param rpcUrl RPC URL (optional)
   */
  static createLocalWallet(
    privateKey: string,
    blockchainType: BlockchainType,
    rpcUrl?: string
  ): LocalWalletAdapter {
    return new LocalWalletAdapter(privateKey, blockchainType, rpcUrl);
  }
  
  /**
   * Generate temporary wallet
   * @param blockchainType Blockchain type
   */
  static generateTempWallet(blockchainType: BlockchainType): { 
    wallet: LocalWalletAdapter; 
    privateKey: string; 
  } {
    if (blockchainType === BlockchainType.ETHEREUM) {
      const wallet = ethers.Wallet.createRandom();
      return {
        wallet: new LocalWalletAdapter(wallet.privateKey, BlockchainType.ETHEREUM),
        privateKey: wallet.privateKey
      };
    } else if (blockchainType === BlockchainType.SOLANA) {
      const keypair = Keypair.generate();
      const privateKey = bs58.encode(keypair.secretKey);
      return {
        wallet: new LocalWalletAdapter(privateKey, BlockchainType.SOLANA),
        privateKey
      };
    }
    
    throw new Error(`Unsupported blockchain type: ${blockchainType}`);
  }
}

// Secure key management service
export class SecureKeyManager {
  private keys: Map<string, { 
    key: string;
    expiry: number;
  }> = new Map();
  
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Temporarily store private key
   * @param key Private key
   * @param expiryMs Expiration time (milliseconds)
   * @returns Token for retrieving private key
   */
  storeKeyTemporarily(key: string, expiryMs: number = this.DEFAULT_EXPIRY): string {
    // Generate unique token
    const token = uuidv4();
    
    // Store private key and expiration time
    this.keys.set(token, {
      key,
      expiry: Date.now() + expiryMs
    });
    
    // Set timer to automatically clear expired private key
    setTimeout(() => {
      this.keys.delete(token);
    }, expiryMs);
    
    return token;
  }
  
  /**
   * Retrieve private key and immediately destroy
   * @param token Token
   * @returns Private key or null (if token invalid or expired)
   */
  retrieveKey(token: string): string | null {
    const entry = this.keys.get(token);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.keys.delete(token);
      return null;
    }
    
    // Retrieve private key and immediately delete
    this.keys.delete(token);
    return entry.key;
  }
  
  /**
   * Clear all stored private keys
   */
  clearAllKeys(): void {
    this.keys.clear();
  }
} 