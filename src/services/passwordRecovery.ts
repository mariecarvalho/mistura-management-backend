import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { sendRecoveryEmail } from '../utils/email';
import bcrypt from 'bcrypt';

export const startPasswordRecovery = async (email: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    throw new Error('Usuário não encontrado');
  }

  const code = uuidv4().slice(0, 6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

  await pool.query(`
    INSERT INTO password_recovery (email, code, expires_at)
    VALUES ($1, $2, $3)
  `, [email, code, expiresAt]);

  await sendRecoveryEmail(email, code);
};

export const verifyRecoveryCode = async (email: string, code: string) => {
  const result = await pool.query(`
    SELECT * FROM password_recovery
    WHERE email = $1 AND code = $2 AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `, [email, code]);

  return result.rows.length > 0;
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const isValid = await verifyRecoveryCode(email, code);
  if (!isValid) throw new Error('Código inválido ou expirado');

  const hash = await bcrypt.hash(newPassword, 10);

  await pool.query(`
    UPDATE users SET password_hash = $1 WHERE email = $2
  `, [hash, email]);

  await pool.query(`
    DELETE FROM password_recovery WHERE email = $1
  `, [email]);
};
