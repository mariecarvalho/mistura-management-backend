import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';
import { register } from '../controllers/auth.controller';
import pool from '../config/database';
import { Request, Response } from 'express';

const router = Router();

// Listar todos os usuários (admin only)
router.get('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Criar usuário (admin only)
router.post('/', authenticate, requireAdmin, register);

// Ativar/desativar usuário (admin only)
router.patch('/:id/toggle', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE users SET is_active = NOT is_active WHERE id = $1
       RETURNING id, name, email, role, is_active`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Remover usuário (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
});

export default router;
