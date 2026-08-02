import { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from '../services/dashboard';

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};
