import express from 'express';
import { auth } from '../middleware/auth.js';
import { listPrices, getPriceById, getPriceBySport, createPrice, updatePrice, deletePrice } from '../Controller/pricecontroller.js';

const router = express.Router();

router.get('/', auth, listPrices);
router.get('/sport/:sport', auth, getPriceBySport);
router.get('/:id', auth, getPriceById);
router.post('/',  auth,createPrice);
router.put('/:id',auth,  updatePrice);
router.delete('/:id',auth,  deletePrice);

export default router;
