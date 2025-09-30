import express from 'express';
import { createBooking, getBookings, deleteBooking, getReport, unlockBooking } from '../Controller/bookingcontroller.js';

const router = express.Router();

router.get('/', getBookings);
router.get('/report', getReport);
router.post('/', createBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id/unlock', unlockBooking);

console.log("Booking routes loaded");

export default router;
