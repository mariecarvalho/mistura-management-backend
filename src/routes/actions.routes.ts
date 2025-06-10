import { Router } from 'express';
import * as ActionsController from '../controllers/actions.controller';

const router = Router();

router.get('/', ActionsController.getAllActions);
router.get('/:id', ActionsController.getActionById);
router.post('/', ActionsController.createAction);
router.put('/:id', ActionsController.updateAction);
router.delete('/:id', ActionsController.deleteAction);

export default router;
