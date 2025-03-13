import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Tokenomics } from '../models/Tokenomics';
import { generateTokenomics as generateTokenomicsAI } from '../services/aiService';

// Generate a new tokenomics model
export const generateTokenomics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      projectName,
      projectDescription,
      tokenName,
      tokenSymbol,
      totalSupply,
      useCase,
      monetizationStrategy,
    } = req.body;

    // Generate tokenomics model using AI
    const tokenomicsData = await generateTokenomicsAI({
      projectName,
      projectDescription,
      tokenName,
      tokenSymbol,
      totalSupply,
      useCase,
      monetizationStrategy,
    });

    // Create a new tokenomics document
    const tokenomics = await Tokenomics.create({
      user: req.user._id,
      projectName,
      projectDescription,
      tokenName,
      tokenSymbol,
      totalSupply,
      useCase,
      monetizationStrategy,
      distribution: tokenomicsData.distribution,
      vestingSchedules: tokenomicsData.vestingSchedules,
      utility: tokenomicsData.utility,
      valueCaptureModel: tokenomicsData.valueCaptureModel,
      incentiveStructure: tokenomicsData.incentiveStructure,
      governanceModel: tokenomicsData.governanceModel,
    });

    res.status(201).json({
      status: 'success',
      data: {
        tokenomics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all tokenomics models for the authenticated user
export const getTokenomicsModels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenomicsModels = await Tokenomics.find({ user: req.user._id });

    res.status(200).json({
      status: 'success',
      results: tokenomicsModels.length,
      data: {
        tokenomicsModels,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific tokenomics model
export const getTokenomicsModel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenomics = await Tokenomics.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!tokenomics) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tokenomics model not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        tokenomics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a tokenomics model
export const updateTokenomicsModel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenomics = await Tokenomics.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tokenomics) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tokenomics model not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        tokenomics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a tokenomics model
export const deleteTokenomicsModel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenomics = await Tokenomics.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!tokenomics) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tokenomics model not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}; 