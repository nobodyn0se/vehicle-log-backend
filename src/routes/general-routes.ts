import {Router} from 'express';

const router = Router();

router.get('/logs', logController);

export default router;