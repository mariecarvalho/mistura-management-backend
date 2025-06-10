import { Request, Response, NextFunction } from 'express';
import * as FamiliesService from '../services/families';

export const getAllFamilies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const families = await FamiliesService.getAllFamilies();
    res.json(families);
  } catch (err) {
    next(err);
  }
};

export const getFamilyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const family = await FamiliesService.getFamilyById(Number(id));

    if (!family) {
      const error = new Error('Family not found');
      (error as any).statusCode = 404;
      throw error;
    }

    res.json(family);
  } catch (err) {
    next(err);
  }
};

export const createFamily = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newFamily = await FamiliesService.createFamily(req.body);
    res.status(201).json(newFamily);
  } catch (err) {
    next(err);
  }
};

export const updateFamily = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedFamily = await FamiliesService.updateFamily(Number(id), req.body);

    if (!updatedFamily) {
      const error = new Error('Family not found');
      (error as any).statusCode = 404;
      throw error;
    }

    res.json(updatedFamily);
  } catch (err) {
    next(err);
  }
};

export const deleteFamily = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await FamiliesService.deleteFamily(Number(id));

    if (!deleted) {
      const error = new Error('Family not found');
      (error as any).statusCode = 404;
      throw error;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
