import { Router } from 'express';
import { login, verifyToken, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/login', login);             
router.post('/verify', verifyToken);     
router.get('/me', authenticate, getProfile);

export default router;
