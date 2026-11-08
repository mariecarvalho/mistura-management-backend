import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const handleGoogleOAuth = {
  getLoginURL: (): string => {
    return client.generateAuthUrl({
      access_type: 'online',
      prompt: 'select_account',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    });
  },

  processCallback: async (code: string) => {
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      throw new Error('Google não retornou id_token');
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      throw new Error('Email do Google ausente ou não verificado');
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email;

    const existing = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
    let user = existing.rows[0];

    if (user) {
      if (user.is_active === false) {
        throw new Error('Usuário inativo');
      }
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2', [
          payload.sub,
          user.id,
        ]);
      }
    } else {
      // password_hash é NOT NULL: grava um hash de senha aleatória, impossível de usar no login por senha.
      const unusableHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const inserted = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, google_id)
         VALUES ($1, $2, $3, 'volunteer', $4)
         RETURNING *`,
        [name, email, unusableHash, payload.sub]
      );
      user = inserted.rows[0];
    }

    // Todo voluntário que entra pelo Google passa a constar na lista de voluntários.
    if (user.role === 'volunteer') {
      const volunteer = await pool.query('SELECT id FROM volunteer WHERE LOWER(email) = $1', [email]);
      if (volunteer.rows.length === 0) {
        await pool.query('INSERT INTO volunteer (name, email) VALUES ($1, $2)', [name, email]);
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return { user, token };
  },
};
