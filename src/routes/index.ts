import { Router } from 'express';
import familiesRoutes from './families.routes';
import actionsRoutes from './actions.routes';
import authRoutes from './auth.routes';
import oauthRoutes from './oauth.routes';

const router = Router();

router.use('/families', familiesRoutes);
router.use('/actions', actionsRoutes);
router.use('/auth', authRoutes);
router.use('/oauth', oauthRoutes);

export default router;