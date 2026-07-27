import { Router } from 'express';
import { FIRController } from '../controllers/firController';

const router = Router();

router.get('/', FIRController.listFIRs);
router.post('/audio-draft', FIRController.createAudioDraft);
router.post('/:firId/typed-draft', FIRController.submitOfficerTypedDraft);
router.post('/:firId/register', FIRController.registerFIR);
router.post('/:firId/reject', FIRController.rejectFIR);
router.get('/sp/escalations', FIRController.getSPEscalationQueue);
router.post('/:firId/sp-action', FIRController.spDecision);
router.get('/:firId', FIRController.getFIRById);

export default router;
