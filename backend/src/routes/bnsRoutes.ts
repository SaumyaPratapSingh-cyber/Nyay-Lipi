import { Router } from 'express';
import { BNSController } from '../controllers/bnsController';

const router = Router();

router.get('/search', BNSController.searchBNS);
router.get('/section/:sectionNumber', BNSController.getBNSBySection);

export default router;
