import mongoose, { Document, Schema } from 'mongoose';

export interface IWhitepaper extends Document {
  user: mongoose.Types.ObjectId;
  projectName: string;
  projectDescription: string;
  industry: string;
  targetAudience: string;
  problemStatement: string;
  solutionDescription: string;
  tokenomics?: {
    tokenName?: string;
    tokenSymbol?: string;
    totalSupply?: number;
    distribution?: {
      category: string;
      percentage: number;
      description?: string;
    }[];
  };
  roadmap?: {
    phase: string;
    description: string;
    timeline: string;
    milestones?: string[];
  }[];
  team?: {
    name: string;
    role: string;
    bio?: string;
  }[];
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const whitepaperSchema = new Schema<IWhitepaper>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Whitepaper must belong to a user'],
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    projectDescription: {
      type: String,
      required: [true, 'Project description is required'],
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
    },
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
    },
    solutionDescription: {
      type: String,
      required: [true, 'Solution description is required'],
    },
    tokenomics: {
      tokenName: String,
      tokenSymbol: String,
      totalSupply: Number,
      distribution: [
        {
          category: String,
          percentage: Number,
          description: String,
        },
      ],
    },
    roadmap: [
      {
        phase: String,
        description: String,
        timeline: String,
        milestones: [String],
      },
    ],
    team: [
      {
        name: String,
        role: String,
        bio: String,
      },
    ],
    content: {
      type: String,
      required: [true, 'Whitepaper content is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Whitepaper = mongoose.model<IWhitepaper>('Whitepaper', whitepaperSchema); 