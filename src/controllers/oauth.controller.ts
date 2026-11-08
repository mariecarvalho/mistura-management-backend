import { Request, Response } from 'express';
import { handleGoogleOAuth } from '../services/oauth';

export const googleLogin = (_req: Request, res: Response) => {
  res.redirect(handleGoogleOAuth.getLoginURL());
};

export const googleCallback = async (req: Request, res: Response) => {
  const frontendUrl = (
    process.env.FRONTEND_OAUTH_SUCCESS_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:8080'
  ).replace(/\/+$/, '');

  try {
    const { code } = req.query;
    if (typeof code !== 'string') {
      throw new Error('Código de autorização ausente');
    }
    const { token } = await handleGoogleOAuth.processCallback(code);
    res.redirect(`${frontendUrl}/?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('Erro no Google OAuth:', err);
    res.redirect(`${frontendUrl}/?oauth_error=1`);
  }
};
