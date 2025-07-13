import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const handleGoogleOAuth = {
  getLoginURL: (): string => {
    console.log("etrou meeeeesmo")

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];
    const url = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    });
    return url;
  },
  processCallback: async (code: string) => {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error('Não foi possível obter email do usuário do Google');
    }

    const email = payload.email.toLowerCase();
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      const id = uuidv4();
      const name = payload.name || 'Usuário Google';
      const role = 'volunteer';

      await pool.query(
        `INSERT INTO users (id, name, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [id, name, email, role]
      );

      const newUserResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      user = newUserResult.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return { user, token };
  },
};
