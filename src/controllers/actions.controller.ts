import { Request, Response, NextFunction } from 'express';
import * as ActionService from '../services/action';

export const getAllActions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actions = await ActionService.getAllActions();
    res.json(actions);
  } catch (err) {
    next(err);
  }
};

export const getActionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const action = await ActionService.getActionById(id);

    if (!action) {
      const error = new Error('Action not found');
      (error as any).statusCode = 404;
      throw error;
    }

    res.json(action);
  } catch (err) {
    next(err);
  }
};

export const createAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('ENTROU AQUI')
    const action = await ActionService.createAction(req.body);
    res.status(201).json(action);
  } catch (err) {
    next(err);
  }
};

export const updateAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedAction = await ActionService.updateAction(id, req.body);

    if (!updatedAction) {
      const error = new Error('Action not found');
      (error as any).statusCode = 404;
      throw error;
    }

    res.json(updatedAction);
  } catch (err) {
    next(err);
  }
};

export const deleteAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await ActionService.deleteAction(id);

    if (!deleted) {
      const error = new Error('Action not found');
      (error as any).statusCode = 404;
      throw error;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
