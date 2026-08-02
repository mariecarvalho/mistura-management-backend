import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './authenticate';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as JwtPayload | undefined;

  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Acesso restrito a administradores' });
    return;
  }

  next();
};
