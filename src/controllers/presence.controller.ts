import { Request, Response, NextFunction } from 'express';
import * as PresenceService from '../services/presence';

export const toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const family = await PresenceService.toggleFamilyStatus(req.params.id);
    if (!family) { res.status(404).json({ error: 'Família não encontrada' }); return; }
    res.json(family);
  } catch (err) { next(err); }
};

export const markPresence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionId, date, mealsTaken } = req.body;
    const presence = await PresenceService.markPresence(req.params.id, actionId, date, mealsTaken);
    res.status(201).json(presence);
  } catch (err) { next(err); }
};

export const unmarkPresence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionId } = req.body;
    await PresenceService.unmarkPresence(req.params.id, actionId);
    res.status(204).send();
  } catch (err) { next(err); }
};

export const getPresenceByAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await PresenceService.getPresenceByAction(req.params.actionId);
    res.json(rows);
  } catch (err) { next(err); }
};

export const getPresenceByFamily = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await PresenceService.getPresenceByFamily(req.params.id);
    res.json(rows);
  } catch (err) { next(err); }
};

export const getAbsentFamilies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lastN = Number(req.query.lastN) || 3;
    const rows = await PresenceService.getAbsentFamilies(lastN);
    res.json(rows);
  } catch (err) { next(err); }
};

export const bulkPresence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionId, date, entries } = req.body as {
      actionId: string;
      date: string;
      entries: { familyId: string; mealsTaken?: number }[];
    };
    await Promise.all(
      entries.map(e => PresenceService.markPresence(e.familyId, actionId, date, e.mealsTaken))
    );
    res.status(201).json({ marked: entries.length });
  } catch (err) { next(err); }
};

export const getFamilyPresenceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await PresenceService.getFamilyPresenceStats(req.params.id);
    res.json(stats);
  } catch (err) { next(err); }
};
