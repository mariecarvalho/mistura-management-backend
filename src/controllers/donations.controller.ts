import { Request, Response, NextFunction } from 'express';
import * as DonationService from '../services/donations';

export const getAllDonations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await DonationService.getAllDonations());
  } catch (err) { next(err); }
};

export const getDonationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const donation = await DonationService.getDonationById(req.params.id);
    if (!donation) { (req as any).statusCode = 404; throw new Error('Not found'); }
    res.json(donation);
  } catch (err) { next(err); }
};

export const createDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await DonationService.createDonation(req.body));
  } catch (err) { next(err); }
};

export const updateDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const donation = await DonationService.updateDonation(req.params.id, req.body);
    if (!donation) { (req as any).statusCode = 404; throw new Error('Not found'); }
    res.json(donation);
  } catch (err) { next(err); }
};

export const deleteDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await DonationService.deleteDonation(req.params.id);
    if (!deleted) { (req as any).statusCode = 404; throw new Error('Not found'); }
    res.status(204).send();
  } catch (err) { next(err); }
};
