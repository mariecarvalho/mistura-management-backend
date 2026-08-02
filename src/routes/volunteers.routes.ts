import { Router } from 'express';
import * as VolunteerController from '../controllers/volunteers.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.get('/',    authenticate, VolunteerController.getAllVolunteers);
router.get('/:id', authenticate, VolunteerController.getVolunteerById);

router.post('/',    authenticate, requireAdmin, VolunteerController.createVolunteer);
router.put('/:id',  authenticate, requireAdmin, VolunteerController.updateVolunteer);
router.delete('/:id', authenticate, requireAdmin, VolunteerController.deleteVolunteer);

export default router;
