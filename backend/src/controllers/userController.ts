import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

// Get user profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          profileImage: user.profileImage,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, profileImage } = req.body;
    
    // Only allow updating certain fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username, profileImage },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: updatedUser?._id,
          email: updatedUser?.email,
          username: updatedUser?.username,
          profileImage: updatedUser?.profileImage,
          role: updatedUser?.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}; 