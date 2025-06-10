import { Router } from 'express';
import * as FamiliesController from '../controllers/families.controller';

const router = Router();

router.get('/', FamiliesController.getAllFamilies);

router.get('/:id', FamiliesController.getFamilyById);

router.post('/', FamiliesController.createFamily);

router.put('/:id', FamiliesController.updateFamily);

router.delete('/:id', FamiliesController.deleteFamily);

export default router;
