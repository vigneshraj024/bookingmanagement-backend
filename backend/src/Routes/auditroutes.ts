import express from 'express';
import { auth } from '../middleware/auth.js';
import { listAuditLogs } from '../Controller/auditcontroller.js';

const router = express.Router();

router.get('/',  listAuditLogs);

export default router;
