"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingcontroller_1 = require("../Controller/bookingcontroller");
const router = express_1.default.Router();
router.get('/', bookingcontroller_1.getBookings);
router.get('/report', bookingcontroller_1.getReport);
router.post('/', bookingcontroller_1.createBooking);
router.delete('/:id', bookingcontroller_1.deleteBooking);
exports.default = router;
