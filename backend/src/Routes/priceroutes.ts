import express from 'express';
import { auth } from '../middleware/auth.js';
import { listPrices, getPriceById, getPriceBySport, createPrice, updatePrice, deletePrice } from '../Controller/pricecontroller.js';

const router = express.Router();

router.get('/', listPrices);
router.get('/sport/:sport', getPriceBySport);
router.get('/:id', getPriceById);
router.post('/', createPrice);
router.put('/:id', updatePrice);
router.delete('/:id', deletePrice);

export default router;
