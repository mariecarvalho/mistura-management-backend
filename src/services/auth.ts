import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { UserRow } from '../models/user';

export const authenticateUser = async (email: string, password: string): Promise<{ user: UserRow, token: string } | null> => {
  const result = await pool.query<UserRow>(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)', 
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }
  
  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    return null;
  }
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  return { user, token };
};
