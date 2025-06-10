import { Router } from 'express';
import familiesRoutes from './families.routes';
import actionsRoutes from './actions.routes';

const router = Router();

router.use('/families', familiesRoutes);
router.use('/actions', actionsRoutes);

export default router;