import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { BN } from 'bn.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Solana Blockchain Service
 * Provides methods for interacting with Solana smart contracts
 */
export class SolanaService {
  private connection: Connection;
  private tokenProgramId: PublicKey;
  private nftProgramId: PublicKey;
  private payerKeypair: Keypair | null = null;

  /**
   * Constructor
   */
  constructor() {
    // Initialize Solana connection
    const network = process.env.SOLANA_NETWORK || 'devnet';
    const endpoint = this.getEndpointForNetwork(network);
    this.connection = new Connection(endpoint, 'confirmed');

    // Set program IDs (these IDs should be obtained after contract deployment)
    this.tokenProgramId = new PublicKey(process.env.SOLANA_TOKEN_PROGRAM_ID || '11111111111111111111111111111111');
    this.nftProgramId = new PublicKey(process.env.SOLANA_NFT_PROGRAM_ID || '11111111111111111111111111111111');

    // Try to load payer keypair
    this.loadPayerKeypair();
  }

  /**
   * Get endpoint URL based on network name
   * @param network Network name
   * @returns Network endpoint URL
   */
  private getEndpointForNetwork(network: string): string {
    switch (network.toLowerCase()) {
      case 'mainnet':
        return 'https://api.mainnet-beta.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      case 'devnet':
      default:
        return 'https://api.devnet.solana.com';
    }
  }

  /**
   * Load payer keypair
   */
  private loadPayerKeypair(): void {
    try {
      const keypairPath = process.env.SOLANA_KEYPAIR_PATH;
      if (!keypairPath) {
        console.warn('No keypair path specified in environment variables.');
        return;
      }

      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      this.payerKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
      console.log('Payer keypair loaded successfully.');
    } catch (error) {
      console.error('Failed to load keypair:', error);
    }
  }

  /**
   * Create token mint account
   * @param decimals Decimal precision
   * @param mintAuthority Mint authority holder
   * @returns Mint account public key and transaction signature
   */
  async createTokenMint(decimals: number = 9, mintAuthority?: PublicKey): Promise<{ mintAddress: string; signature: string }> {
    if (!this.payerKeypair) {
      throw new Error('Payer keypair is not loaded.');
    }

    // Use provided mint authority or default to payer public key
    const actualMintAuthority = mintAuthority || this.payerKeypair.publicKey;

    // Create a new mint account
    const mintAccount = Keypair.generate();
    console.log('Creating token mint:', mintAccount.publicKey.toString());

    // Calculate required space
    const mintSpace = 44; // Size of Mint structure

    // Calculate rent exempt balance
    const rentExemptBalance = await this.connection.getMinimumBalanceForRentExemption(mintSpace);

    // Create system instruction to create account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: this.payerKeypair.publicKey,
      newAccountPubkey: mintAccount.publicKey,
      lamports: rentExemptBalance,
      space: mintSpace,
      programId: this.tokenProgramId,
    });

    // Create instruction to initialize mint account
    const initMintInstruction = new TransactionInstruction({
      keys: [
        { pubkey: mintAccount.publicKey, isSigner: false, isWritable: true },
        { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
      ],
      programId: this.tokenProgramId,
      data: Buffer.from([
        0, // Instruction index (0 = InitializeMint)
        decimals, // Precision
        ...actualMintAuthority.toBuffer(), // Mint authority
      ]),
    });

    // Create and send transaction
    const transaction = new Transaction().add(
      createAccountInstruction,
      initMintInstruction
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair, mintAccount],
      { commitment: 'confirmed' }
    );

    return {
      mintAddress: mintAccount.publicKey.toString(),
      signature,
    };
  }

  /**
   * Create token account
   * @param mintAddress Mint account address
   * @param owner Account owner (default is payer)
   * @returns Token account address and transaction signature
   */
  async createTokenAccount(mintAddress: string, owner?: PublicKey): Promise<{ tokenAccountAddress: string; signature: string }> {
    if (!this.payerKeypair) {
      throw new Error('Payer keypair is not loaded.');
    }

    const mintPubkey = new PublicKey(mintAddress);
    const actualOwner = owner || this.payerKeypair.publicKey;

    // Create a new token account
    const tokenAccount = Keypair.generate();
    console.log('Creating token account:', tokenAccount.publicKey.toString());

    // Calculate required space
    const tokenAccountSpace = 41; // Size of TokenAccount structure

    // Calculate rent exempt balance
    const rentExemptBalance = await this.connection.getMinimumBalanceForRentExemption(tokenAccountSpace);

    // Create system instruction to create account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: this.payerKeypair.publicKey,
      newAccountPubkey: tokenAccount.publicKey,
      lamports: rentExemptBalance,
      space: tokenAccountSpace,
      programId: this.tokenProgramId,
    });

    // Create instruction to initialize token account
    const initTokenAccountInstruction = new TransactionInstruction({
      keys: [
        { pubkey: tokenAccount.publicKey, isSigner: false, isWritable: true },
        { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
      ],
      programId: this.tokenProgramId,
      data: Buffer.from([
        4, // Instruction index (4 = InitializeAccount, assuming this instruction is implemented in the contract)
        ...actualOwner.toBuffer(), // Account owner
      ]),
    });

    // Create and send transaction
    const transaction = new Transaction().add(
      createAccountInstruction,
      initTokenAccountInstruction
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair, tokenAccount],
      { commitment: 'confirmed' }
    );

    return {
      tokenAccountAddress: tokenAccount.publicKey.toString(),
      signature,
    };
  }

  /**
   * Mint tokens
   * @param mintAddress Mint account address
   * @param destinationAddress Destination account address
   * @param amount Amount to mint
   * @returns Transaction signature
   */
  async mintTokens(mintAddress: string, destinationAddress: string, amount: number): Promise<string> {
    if (!this.payerKeypair) {
      throw new Error('Payer keypair is not loaded.');
    }

    const mintPubkey = new PublicKey(mintAddress);
    const destinationPubkey = new PublicKey(destinationAddress);
    const amountBN = new BN(amount);

    // Create instruction to mint tokens
    const mintInstruction = new TransactionInstruction({
      keys: [
        { pubkey: mintPubkey, isSigner: false, isWritable: true },
        { pubkey: destinationPubkey, isSigner: false, isWritable: true },
        { pubkey: this.payerKeypair.publicKey, isSigner: true, isWritable: false },
      ],
      programId: this.tokenProgramId,
      data: Buffer.from([
        1, // Instruction index (1 = MintTo)
        ...amountBN.toArray('le', 8), // Amount (little-endian, 8 bytes)
      ]),
    });

    // Create and send transaction
    const transaction = new Transaction().add(mintInstruction);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Transfer tokens
   * @param sourceAddress Source account address
   * @param destinationAddress Destination account address
   * @param amount Amount to transfer
   * @returns Transaction signature
   */
  async transferTokens(sourceAddress: string, destinationAddress: string, amount: number): Promise<string> {
    if (!this.payerKeypair) {
      throw new Error('Payer keypair is not loaded.');
    }

    const sourcePubkey = new PublicKey(sourceAddress);
    const destinationPubkey = new PublicKey(destinationAddress);
    const amountBN = new BN(amount);

    // Create instruction to transfer tokens
    const transferInstruction = new TransactionInstruction({
      keys: [
        { pubkey: sourcePubkey, isSigner: false, isWritable: true },
        { pubkey: destinationPubkey, isSigner: false, isWritable: true },
        { pubkey: this.payerKeypair.publicKey, isSigner: true, isWritable: false },
      ],
      programId: this.tokenProgramId,
      data: Buffer.from([
        2, // Instruction index (2 = Transfer)
        ...amountBN.toArray('le', 8), // Amount (little-endian, 8 bytes)
      ]),
    });

    // Create and send transaction
    const transaction = new Transaction().add(transferInstruction);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Burn tokens
   * @param tokenAccountAddress Token account address
   * @param mintAddress Mint account address
   * @param amount Amount to burn
   * @returns Transaction signature
   */
  async burnTokens(tokenAccountAddress: string, mintAddress: string, amount: number): Promise<string> {
    if (!this.payerKeypair) {
      throw new Error('Payer keypair is not loaded.');
    }

    const tokenAccountPubkey = new PublicKey(tokenAccountAddress);
    const mintPubkey = new PublicKey(mintAddress);
    const amountBN = new BN(amount);

    // Create instruction to burn tokens
    const burnInstruction = new TransactionInstruction({
      keys: [
        { pubkey: tokenAccountPubkey, isSigner: false, isWritable: true },
        { pubkey: mintPubkey, isSigner: false, isWritable: true },
        { pubkey: this.payerKeypair.publicKey, isSigner: true, isWritable: false },
      ],
      programId: this.tokenProgramId,
      data: Buffer.from([
        3, // Instruction index (3 = Burn)
        ...amountBN.toArray('le', 8), // Amount (little-endian, 8 bytes)
      ]),
    });

    // Create and send transaction
    const transaction = new Transaction().add(burnInstruction);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Create NFT
   * @param name NFT name
   * @param symbol NFT symbol
   * @param uri NFT metadata URI
   * @param royaltyPercentage Royalty percentage
   * @param isMutable Whether mutable
   * @returns NFT account address and transaction signature
   */
  async createNFT(
    name: string,
    symbol: string,
    uri: string,
    royaltyPercentage: number = 0,
    isMutable: boolean = false
  ): Promise<{ nftAddress: string; signature: string }> {
    if (!this.payerKeypair) {
      throw new Error('Payer keypair is not loaded.');
    }

    // Create NFT account
    const nftAccount = Keypair.generate();
    console.log('Creating NFT:', nftAccount.publicKey.toString());

    // Estimate space needed for NFT account
    // This size depends on the size of NFTMetadata structure and the length of name, symbol, uri
    // This is just an estimate, in a real application you should calculate a more precise value
    const estimatedSize = 500;

    // Calculate rent exempt balance
    const rentExemptBalance = await this.connection.getMinimumBalanceForRentExemption(estimatedSize);

    // Create system instruction to create account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: this.payerKeypair.publicKey,
      newAccountPubkey: nftAccount.publicKey,
      lamports: rentExemptBalance,
      space: estimatedSize,
      programId: this.nftProgramId,
    });

    // Create NFT data
    const createNftData = {
      name,
      symbol,
      uri,
      royaltyPercentage,
      isMutable,
    };

    // Serialize data to Borsh format
    // Note: This simplifies the serialization process, in a real application you should use Borsh library to serialize correctly
    const serializedData = Buffer.from(JSON.stringify(createNftData));
    
    // Create CreateNFT instruction
    const createNftInstruction = new TransactionInstruction({
      keys: [
        { pubkey: nftAccount.publicKey, isSigner: false, isWritable: true },
        { pubkey: this.payerKeypair.publicKey, isSigner: true, isWritable: false },
        { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
      ],
      programId: this.nftProgramId,
      data: serializedData,
    });

    // Create and send transaction
    const transaction = new Transaction().add(
      createAccountInstruction,
      createNftInstruction
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair, nftAccount],
      { commitment: 'confirmed' }
    );

    return {
      nftAddress: nftAccount.publicKey.toString(),
      signature,
    };
  }

  /**
   * Transfer NFT ownership
   * @param nftAddress NFT account address
   * @param newOwnerAddress New owner address
   * @returns Transaction signature
   */
  async transferNFT(nftAddress: string, newOwnerAddress: string): Promise<string> {
    if (!this.payerKeypair) {
      throw new Error('Payer keypair is not loaded.');
    }

    const nftPubkey = new PublicKey(nftAddress);
    const newOwnerPubkey = new PublicKey(newOwnerAddress);

    // Create data for transferring NFT
    const transferData = {
      newOwner: newOwnerAddress,
    };

    // Serialize data
    // Note: This simplifies the serialization process
    const serializedData = Buffer.from(JSON.stringify(transferData));

    // Create TransferNFT instruction
    const transferNftInstruction = new TransactionInstruction({
      keys: [
        { pubkey: nftPubkey, isSigner: false, isWritable: true },
        { pubkey: this.payerKeypair.publicKey, isSigner: true, isWritable: false },
        { pubkey: newOwnerPubkey, isSigner: false, isWritable: false },
      ],
      programId: this.nftProgramId,
      data: serializedData,
    });

    // Create and send transaction
    const transaction = new Transaction().add(transferNftInstruction);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Update NFT metadata
   * @param nftAddress NFT account address
   * @param name New name (optional)
   * @param symbol New symbol (optional)
   * @param uri New URI (optional)
   * @returns Transaction signature
   */
  async updateNFTMetadata(
    nftAddress: string,
    name?: string,
    symbol?: string,
    uri?: string
  ): Promise<string> {
    if (!this.payerKeypair) {
      throw new Error('Payer keypair is not loaded.');
    }

    const nftPubkey = new PublicKey(nftAddress);

    // Create data for updating metadata
    const updateData = {
      name,
      symbol,
      uri,
    };

    // Serialize data
    // Note: This simplifies the serialization process
    const serializedData = Buffer.from(JSON.stringify(updateData));

    // Create UpdateMetadata instruction
    const updateMetadataInstruction = new TransactionInstruction({
      keys: [
        { pubkey: nftPubkey, isSigner: false, isWritable: true },
        { pubkey: this.payerKeypair.publicKey, isSigner: true, isWritable: false },
      ],
      programId: this.nftProgramId,
      data: serializedData,
    });

    // Create and send transaction
    const transaction = new Transaction().add(updateMetadataInstruction);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Get account balance
   * @param address Account address
   * @returns SOL balance (lamports)
   */
  async getBalance(address: string): Promise<number> {
    const pubkey = new PublicKey(address);
    return this.connection.getBalance(pubkey);
  }

  /**
   * Get token account info
   * @param tokenAccountAddress Token account address
   * @returns Token account info
   */
  async getTokenAccountInfo(tokenAccountAddress: string): Promise<any> {
    const pubkey = new PublicKey(tokenAccountAddress);
    const accountInfo = await this.connection.getAccountInfo(pubkey);
    
    if (!accountInfo) {
      throw new Error('Token account not found');
    }

    // Here we should parse accountInfo.data to get detailed information about TokenAccount
    // But for simplicity, we only return the raw data
    return accountInfo;
  }

  /**
   * Get token mint info
   * @param mintAddress Mint account address
   * @returns Mint account info
   */
  async getMintInfo(mintAddress: string): Promise<any> {
    const pubkey = new PublicKey(mintAddress);
    const accountInfo = await this.connection.getAccountInfo(pubkey);
    
    if (!accountInfo) {
      throw new Error('Mint account not found');
    }

    // Here we should parse accountInfo.data to get detailed information about Mint
    // But for simplicity, we only return the raw data
    return accountInfo;
  }

  /**
   * Get NFT info
   * @param nftAddress NFT account address
   * @returns NFT info
   */
  async getNFTInfo(nftAddress: string): Promise<any> {
    const pubkey = new PublicKey(nftAddress);
    const accountInfo = await this.connection.getAccountInfo(pubkey);
    
    if (!accountInfo) {
      throw new Error('NFT account not found');
    }

    // Here we should parse accountInfo.data to get detailed information about NFT
    // But for simplicity, we only return the raw data
    return accountInfo;
  }
} 