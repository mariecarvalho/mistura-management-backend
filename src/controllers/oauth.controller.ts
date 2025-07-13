import { Request, Response } from 'express';
import { handleGoogleOAuth } from '../services/oauth';

export const googleLogin = (_req: Request, res: Response) => {
  const url = handleGoogleOAuth.getLoginURL();
  console.log('entrou')
  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    console.log('entrou')
    const { code } = req.query;
    const { user, token } = await handleGoogleOAuth.processCallback(code as string);
    const redirectUrl = `${process.env.FRONTEND_OAUTH_SUCCESS_URL}?token=${token}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Erro no Google OAuth:', err);
    res.status(500).json({ error: 'Erro no login com Google' });
  }
};

