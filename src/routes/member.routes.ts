import { Router } from 'express';
import * as MemberController from '../controllers/member.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.delete('/:id', authenticate, requireAdmin, MemberController.deleteMember);

export default router;
