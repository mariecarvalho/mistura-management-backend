import { Router } from 'express';
import * as ActionController from '../controllers/actions.controller';

const router = Router();

router.get('/', ActionController.getAllActions);
router.get('/:id', ActionController.getActionById);
router.post('/', ActionController.createAction);
router.put('/:id', ActionController.updateAction);
router.delete('/:id', ActionController.deleteAction);

export default router;
