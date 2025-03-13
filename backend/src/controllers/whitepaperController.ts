import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Whitepaper } from '../models/Whitepaper';
import { generateWhitepaperContent } from '../services/aiService';

// Generate a new whitepaper
export const generateWhitepaper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
    } = req.body;

    // Generate whitepaper content using AI
    const whitepaperContent = await generateWhitepaperContent({
      projectName,
      projectDescription,
      industry,
      targetAudience,
      problemStatement,
      solutionDescription,
      tokenomics,
      roadmap,
      team,
    });

    // Create a new whitepaper document
    const whitepaper = await Whitepaper.create({
      user: req.user._id,
      projectName,
      projectDescription,
      industry,
      targetAudience,
      problemStatement,
      solutionDescription,
      tokenomics,
      roadmap,
      team,
      content: whitepaperContent,
    });

    res.status(201).json({
      status: 'success',
      data: {
        whitepaper,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all whitepapers for the authenticated user
export const getWhitepapers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const whitepapers = await Whitepaper.find({ user: req.user._id });

    res.status(200).json({
      status: 'success',
      results: whitepapers.length,
      data: {
        whitepapers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific whitepaper
export const getWhitepaper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const whitepaper = await Whitepaper.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!whitepaper) {
      return res.status(404).json({
        status: 'fail',
        message: 'Whitepaper not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        whitepaper,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a whitepaper
export const updateWhitepaper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const whitepaper = await Whitepaper.findOneAndUpdate(
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

    if (!whitepaper) {
      return res.status(404).json({
        status: 'fail',
        message: 'Whitepaper not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        whitepaper,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a whitepaper
export const deleteWhitepaper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const whitepaper = await Whitepaper.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!whitepaper) {
      return res.status(404).json({
        status: 'fail',
        message: 'Whitepaper not found',
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