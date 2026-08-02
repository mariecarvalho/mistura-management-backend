import { Router } from 'express';
import * as ChildController from '../controllers/child.controller';

const router = Router();

router.delete('/:id', ChildController.deleteChild);

export default router;
