import express from 'express';
import { auth } from '../middleware/auth.js';
import { createAdmin, updateAdmin, deleteAdmin, listAdmins, getAdminById } from '../Controller/admincontroller.js';

const router = express.Router();

router.get('/', auth, listAdmins);
router.get('/:id', auth, getAdminById);
router.post('/', auth, createAdmin);
router.put('/:id', auth, updateAdmin);
router.delete('/:id', auth, deleteAdmin);

export default router;
