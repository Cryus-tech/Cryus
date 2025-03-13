import mongoose, { Document, Schema } from 'mongoose';

export interface ITokenomics extends Document {
  user: mongoose.Types.ObjectId;
  projectName: string;
  projectDescription: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  useCase: string;
  monetizationStrategy: string;
  distribution: {
    category: string;
    percentage: number;
    description?: string;
    lockupPeriod?: string;
  }[];
  vestingSchedules: {
    stakeholderType: string;
    schedule: {
      period: string;
      percentage: number;
      description?: string;
    }[];
  }[];
  utility: string[];
  valueCaptureModel: string;
  incentiveStructure: {
    stakeholderType: string;
    incentives: string[];
  }[];
  governanceModel: {
    type: string;
    description: string;
    votingMechanism?: string;
    proposalThreshold?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const tokenomicsSchema = new Schema<ITokenomics>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tokenomics model must belong to a user'],
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
    useCase: {
      type: String,
      required: [true, 'Use case is required'],
    },
    monetizationStrategy: {
      type: String,
      required: [true, 'Monetization strategy is required'],
    },
    distribution: [
      {
        category: {
          type: String,
          required: [true, 'Distribution category is required'],
        },
        percentage: {
          type: Number,
          required: [true, 'Distribution percentage is required'],
          min: 0,
          max: 100,
        },
        description: String,
        lockupPeriod: String,
      },
    ],
    vestingSchedules: [
      {
        stakeholderType: {
          type: String,
          required: [true, 'Stakeholder type is required'],
        },
        schedule: [
          {
            period: {
              type: String,
              required: [true, 'Vesting period is required'],
            },
            percentage: {
              type: Number,
              required: [true, 'Vesting percentage is required'],
              min: 0,
              max: 100,
            },
            description: String,
          },
        ],
      },
    ],
    utility: [String],
    valueCaptureModel: {
      type: String,
      required: [true, 'Value capture model is required'],
    },
    incentiveStructure: [
      {
        stakeholderType: {
          type: String,
          required: [true, 'Stakeholder type is required'],
        },
        incentives: [String],
      },
    ],
    governanceModel: {
      type: {
        type: String,
        required: [true, 'Governance model type is required'],
      },
      description: {
        type: String,
        required: [true, 'Governance model description is required'],
      },
      votingMechanism: String,
      proposalThreshold: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Tokenomics = mongoose.model<ITokenomics>('Tokenomics', tokenomicsSchema); 