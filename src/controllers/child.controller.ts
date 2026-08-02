import { Request, Response, NextFunction } from 'express';
import * as ChildrenService from '../services/child';

export const deleteChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    console.log('id', id)
    const deleted = await ChildrenService.deleteChild(id);

    if (!deleted) {
      const error = new Error('Child not found');
      (error as any).statusCode = 404;
      throw error;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
