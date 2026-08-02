import { Request, Response, NextFunction } from 'express';
import * as MemberService from '../services/member';

export const deleteMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await MemberService.deleteMember(id);
    if (!deleted) {
      const error = new Error('Membro não encontrado');
      (error as any).statusCode = 404;
      throw error;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
