import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * Generates a JWT token for a user
 * @param {string} userId - The user's ID to be encoded in the token
 * @returns {string} The generated JWT token
 */
export const generateToken = (userId: string): string => {
  if (!process.env['SECRET']) {
    throw new Error('SECRET not defined in environment variables');
  }
  return jwt.sign({ userId }, process.env['SECRET'], { expiresIn: '24h' });
};

/**
 * The `authenticate` function checks for a valid token in the request headers and verifies it using a
 * secret key before attaching the verified user to the request object.
 * @param {Request} req - The request object containing headers and authorization token
 * @param {Response} _res - The response object (unused but kept for middleware signature)
 * @param {NextFunction} next - Function to pass control to the next middleware
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  if (token && process.env['SECRET']) {
    try {
      const verifiedUser = jwt.verify(token, process.env['SECRET']);
      console.log('Verified User:', verifiedUser);
      (req as any).user = verifiedUser;
    } catch (error) {
      console.log('Invalid token:', error);
    }
  }
  next();
};
