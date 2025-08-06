import {Router} from 'express';
import {logController} from "../controllers/log-controller.ts";

const router = Router();

router.get('/logs', logController);

export default router;