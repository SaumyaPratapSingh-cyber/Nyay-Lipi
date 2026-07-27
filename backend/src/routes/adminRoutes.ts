import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { verifyToken, requireRoles } from '../middlewares/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

// Protect all admin routes with verifyToken + requireRoles([UserRole.ADMIN])
router.use(verifyToken);
router.use(requireRoles([UserRole.ADMIN]));

router.post('/stations', AdminController.createStation);
router.get('/stations', AdminController.getStations);

router.post('/officers', AdminController.createOfficer);
router.get('/users', AdminController.getUsers);
router.put('/users/:userId', AdminController.updateUser);
router.put('/users/:userId/password', AdminController.resetUserPassword);

router.get('/global-firs', AdminController.getGlobalFIRs);

export default router;
