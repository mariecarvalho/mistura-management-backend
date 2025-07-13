import { Request, Response } from 'express';
import { authenticateUser } from '../services/auth';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import bcrypt from 'bcrypt';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const authResult = await authenticateUser(email, password);
  
  if (!authResult) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  res.json({ token: authResult.token, user: authResult.user });
};


export const verifyToken = (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: 'Token inválido' });
      return;
    }

    res.json({ user: decoded });
  });
};

export const getProfile = (req: Request, res: Response): void => {
  res.json({ user: (req as any).user });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'Email já cadastrado' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [id, name, email, passwordHash, role || 'volunteer']
    );

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};