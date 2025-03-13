import mongoose, { Document, Schema } from 'mongoose';

export interface IDapp extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description: string;
  blockchain: string;
  contractAddress?: string;
  features: string[];
  uiFramework: string;
  status: 'draft' | 'generated' | 'deployed';
  repositoryUrl?: string;
  deploymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dappSchema = new Schema<IDapp>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dapp must belong to a user'],
    },
    name: {
      type: String,
      required: [true, 'Dapp name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    blockchain: {
      type: String,
      required: [true, 'Blockchain is required'],
      enum: ['Ethereum', 'Solana', 'Polygon', 'Binance Smart Chain', 'Avalanche'],
    },
    contractAddress: {
      type: String,
      trim: true,
    },
    features: {
      type: [String],
      required: [true, 'Features are required'],
      default: [],
    },
    uiFramework: {
      type: String,
      required: [true, 'UI framework is required'],
      enum: ['React', 'Vue', 'Angular', 'Next.js', 'Nuxt.js'],
    },
    status: {
      type: String,
      enum: ['draft', 'generated', 'deployed'],
      default: 'draft',
    },
    repositoryUrl: {
      type: String,
      trim: true,
    },
    deploymentUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Dapp = mongoose.model<IDapp>('Dapp', dappSchema); 