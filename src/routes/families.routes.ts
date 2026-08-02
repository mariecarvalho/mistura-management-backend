import { Router } from 'express';
import * as FamiliesController from '../controllers/families.controller';
import * as PresenceController from '../controllers/presence.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

// Leitura
router.get('/',    authenticate, FamiliesController.getAllFamilies);
router.get('/:id', authenticate, FamiliesController.getFamilyById);

// Estatísticas e histórico de presença (leitura)
router.get('/:id/presence',       authenticate, PresenceController.getPresenceByFamily);
router.get('/:id/presence/stats', authenticate, PresenceController.getFamilyPresenceStats);

// Escrita: admin
router.post('/',    authenticate, requireAdmin, FamiliesController.createFamily);
router.put('/:id',  authenticate, requireAdmin, FamiliesController.updateFamily);
router.delete('/:id', authenticate, requireAdmin, FamiliesController.deleteFamily);

// Toggle status: admin
router.patch('/:id/toggle-status', authenticate, requireAdmin, PresenceController.toggleStatus);

// Ausências e bulk (admin)
router.get('/absent',          authenticate, requireAdmin, PresenceController.getAbsentFamilies);
router.post('/presence/bulk',  authenticate, requireAdmin, PresenceController.bulkPresence);

// Marcar/desmarcar presença: qualquer autenticado (voluntário também pode)
router.post('/:id/presence',   authenticate, PresenceController.markPresence);
router.delete('/:id/presence', authenticate, PresenceController.unmarkPresence);

export default router;
