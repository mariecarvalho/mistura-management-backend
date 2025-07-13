import { Router } from 'express';
import { googleLogin, googleCallback } from '../controllers/oauth.controller';

const router = Router();

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

export default router;
