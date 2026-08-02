import { Router } from 'express';
import familiesRoutes from './families.routes';
import memberRoutes from './member.routes';
import actionsRoutes from './actions.routes';
import authRoutes from './auth.routes';
import oauthRoutes from './oauth.routes';
import volunteersRoutes from './volunteers.routes';
import dashboardRoutes from './dashboard.routes';
import donationsRoutes from './donations.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/members', memberRoutes);
router.use('/families', familiesRoutes);
router.use('/actions', actionsRoutes);
router.use('/auth', authRoutes);
router.use('/oauth', oauthRoutes);
router.use('/volunteers', volunteersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/donations', donationsRoutes);
router.use('/users', usersRoutes);

export default router;