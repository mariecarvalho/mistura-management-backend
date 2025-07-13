import { JwtPayload } from '../../middlewares/authenticate';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
