import { Router } from 'express';
import * as ActionController from '../controllers/actions.controller';
import * as PresenceController from '../controllers/presence.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.get('/',    authenticate, ActionController.getAllActions);
router.get('/:id', authenticate, ActionController.getActionById);

// Lista de presença + summary de uma ação (qualquer autenticado)
router.get('/:actionId/presence',         authenticate, PresenceController.getPresenceByAction);
router.get('/:actionId/presence/summary', authenticate, ActionController.getPresenceSummary);

router.post('/',    authenticate, requireAdmin, ActionController.createAction);
router.put('/:id',  authenticate, requireAdmin, ActionController.updateAction);
router.delete('/:id', authenticate, requireAdmin, ActionController.deleteAction);

export default router;
