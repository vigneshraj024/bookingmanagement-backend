import express from 'express';
import { login, listAdmins, getAdminById } from '../Controller/authcontroller';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.get('/admins', auth, listAdmins);
router.get('/admins/:id', auth, getAdminById);

export default router;


