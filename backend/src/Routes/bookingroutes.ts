import express from 'express';
import { createBooking, getBookings, deleteBooking, getReport } from '../Controller/bookingcontroller';

const router = express.Router();

router.get('/', getBookings);
router.get('/report', getReport);
router.post('/', createBooking);
router.delete('/:id', deleteBooking);

export default router;
