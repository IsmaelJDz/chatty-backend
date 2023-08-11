import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { NotAuthorizedError } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

export class AuthMiddleware {
  public async verifyUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const token = req.session?.jwt;

    if (!token) {
      throw new NotAuthorizedError('Token is not available, please login');
    }

    try {
      const payload: AuthPayload = JWT.verify(token, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid, please login');
    }

    next();
  }

  public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route');
    }

    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
