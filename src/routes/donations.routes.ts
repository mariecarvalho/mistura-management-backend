import { Router } from 'express';
import * as DonationController from '../controllers/donations.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.get('/',    authenticate, DonationController.getAllDonations);
router.get('/:id', authenticate, DonationController.getDonationById);

router.post('/',    authenticate, requireAdmin, DonationController.createDonation);
router.put('/:id',  authenticate, requireAdmin, DonationController.updateDonation);
router.delete('/:id', authenticate, requireAdmin, DonationController.deleteDonation);

export default router;
