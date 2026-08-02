import { Request, Response, NextFunction } from 'express';
import * as VolunteerService from '../services/volunteers';

export const getAllVolunteers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const volunteers = await VolunteerService.getAllVolunteers();
    res.json(volunteers);
  } catch (err) { next(err); }
};

export const getVolunteerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const volunteer = await VolunteerService.getVolunteerById(req.params.id);
    if (!volunteer) {
      const error = new Error('Volunteer not found');
      (error as any).statusCode = 404;
      throw error;
    }
    res.json(volunteer);
  } catch (err) { next(err); }
};

export const createVolunteer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const volunteer = await VolunteerService.createVolunteer(req.body);
    res.status(201).json(volunteer);
  } catch (err) { next(err); }
};

export const updateVolunteer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const volunteer = await VolunteerService.updateVolunteer(req.params.id, req.body);
    if (!volunteer) {
      const error = new Error('Volunteer not found');
      (error as any).statusCode = 404;
      throw error;
    }
    res.json(volunteer);
  } catch (err) { next(err); }
};

export const deleteVolunteer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await VolunteerService.deleteVolunteer(req.params.id);
    if (!deleted) {
      const error = new Error('Volunteer not found');
      (error as any).statusCode = 404;
      throw error;
    }
    res.status(204).send();
  } catch (err) { next(err); }
};
