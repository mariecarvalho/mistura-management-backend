import { Request, Response, NextFunction } from 'express';

export const getAllActions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([
      { id: 1, title: 'Entrega de Marmitas - Junho', action_date: '2024-06-07', families_served: 25 }
    ]);
  } catch (err) {
    next(err);
  }
};

export const getActionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    res.json({ id, title: `Action ${id}`, action_date: '2024-06-07', families_served: 10 });
  } catch (err) {
    next(err);
  }
};

export const createAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, action_date, families_served } = req.body;
    // Simula uma criação — no model você vai colocar depois
    res.status(201).json({
      id: 999, title, action_date, families_served
    });
  } catch (err) {
    next(err);
  }
};

export const updateAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, action_date, families_served } = req.body;
    res.json({
      id: Number(id), title, action_date, families_served
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
