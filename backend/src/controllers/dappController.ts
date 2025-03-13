import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Dapp } from '../models/Dapp';

// Generate a new dapp
export const generateDapp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      blockchain,
      contractAddress,
      features,
      uiFramework,
    } = req.body;

    // In a real implementation, this would generate code and templates
    // For now, we'll just create a record
    const dapp = await Dapp.create({
      user: req.user._id,
      name,
      description,
      blockchain,
      contractAddress,
      features,
      uiFramework,
      status: 'draft',
    });

    res.status(201).json({
      status: 'success',
      data: {
        dapp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all dapps for the authenticated user
export const getDapps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dapps = await Dapp.find({ user: req.user._id });

    res.status(200).json({
      status: 'success',
      results: dapps.length,
      data: {
        dapps,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific dapp
export const getDapp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dapp = await Dapp.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dapp) {
      return res.status(404).json({
        status: 'fail',
        message: 'Dapp not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        dapp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a dapp
export const updateDapp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dapp = await Dapp.findOneAndUpdate(
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

    if (!dapp) {
      return res.status(404).json({
        status: 'fail',
        message: 'Dapp not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        dapp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a dapp
export const deleteDapp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dapp = await Dapp.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dapp) {
      return res.status(404).json({
        status: 'fail',
        message: 'Dapp not found',
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