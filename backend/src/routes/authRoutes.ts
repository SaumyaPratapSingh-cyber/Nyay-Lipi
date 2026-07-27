import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', verifyToken as any, AuthController.getProfile as any);

export default router;
