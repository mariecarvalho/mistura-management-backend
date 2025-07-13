import { Request, Response } from 'express';
import * as recoveryService from '../services/passwordRecovery';

export const sendRecoveryCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await recoveryService.startPasswordRecovery(email);
    res.status(200).json({ message: 'Código enviado' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const confirmCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const valid = await recoveryService.verifyRecoveryCode(email, code);
    if (!valid) throw new Error('Código inválido ou expirado');
    res.status(200).json({ message: 'Código válido' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    await recoveryService.resetPassword(email, code, newPassword);
    res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};
