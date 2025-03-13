import mongoose, { Document, Schema } from 'mongoose';

export interface IContract extends Document {
  user: mongoose.Types.ObjectId;
  contractType: string;
  blockchain: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  features: string[];
  code: string;
  deploymentStatus: 'draft' | 'deployed' | 'failed';
  deploymentAddress?: string;
  deploymentNetwork?: string;
  deploymentTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<IContract>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contract must belong to a user'],
    },
    contractType: {
      type: String,
      required: [true, 'Contract type is required'],
      enum: ['ERC20', 'ERC721', 'ERC1155', 'SPL Token', 'Custom'],
    },
    blockchain: {
      type: String,
      required: [true, 'Blockchain is required'],
      enum: ['Ethereum', 'Solana', 'Polygon', 'Binance Smart Chain', 'Avalanche'],
    },
    tokenName: {
      type: String,
      required: [true, 'Token name is required'],
      trim: true,
    },
    tokenSymbol: {
      type: String,
      required: [true, 'Token symbol is required'],
      trim: true,
      uppercase: true,
    },
    totalSupply: {
      type: Number,
      required: [true, 'Total supply is required'],
    },
    features: {
      type: [String],
      default: [],
    },
    code: {
      type: String,
      required: [true, 'Contract code is required'],
    },
    deploymentStatus: {
      type: String,
      enum: ['draft', 'deployed', 'failed'],
      default: 'draft',
    },
    deploymentAddress: {
      type: String,
    },
    deploymentNetwork: {
      type: String,
    },
    deploymentTxHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Contract = mongoose.model<IContract>('Contract', contractSchema); 