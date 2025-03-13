import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * 请求验证中间件
 * 用于验证请求参数是否符合要求
 * 
 * @param req Express请求对象
 * @param res Express响应对象
 * @param next Express下一个中间件函数
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
    return;
  }
  
  next();
}; 