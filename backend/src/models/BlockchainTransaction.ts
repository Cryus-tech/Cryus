import mongoose, { Document, Schema } from 'mongoose';

export interface IBlockchainTransaction extends Document {
  user: mongoose.Types.ObjectId;
  transactionType: 'mint_creation' | 'account_creation' | 'token_mint' | 'token_transfer' | 'token_burn' | 'nft_creation' | 'nft_transfer' | 'nft_update';
  blockchain: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  addresses: {
    source?: string;
    destination?: string;
    mint?: string;
    token?: string;
    nft?: string;
  };
  amount?: number;
  data?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const blockchainTransactionSchema = new Schema<IBlockchainTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
    },
    transactionType: {
      type: String,
      enum: ['mint_creation', 'account_creation', 'token_mint', 'token_transfer', 'token_burn', 'nft_creation', 'nft_transfer', 'nft_update'],
      required: [true, 'Transaction type is required'],
    },
    blockchain: {
      type: String,
      required: [true, 'Blockchain is required'],
      enum: ['Ethereum', 'Solana', 'Polygon', 'Binance Smart Chain', 'Avalanche'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
    txHash: {
      type: String,
      trim: true,
    },
    addresses: {
      source: String,
      destination: String,
      mint: String,
      token: String,
      nft: String,
    },
    amount: {
      type: Number,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes to speed up queries
blockchainTransactionSchema.index({ user: 1, transactionType: 1 });
blockchainTransactionSchema.index({ txHash: 1 }, { unique: true, sparse: true });

export const BlockchainTransaction = mongoose.model<IBlockchainTransaction>('BlockchainTransaction', blockchainTransactionSchema); 