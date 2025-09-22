"use strict";
// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import bookingRouter from './Routes/bookingroutes';
// import authRouter from './Routes/authroutes';
// import { auth } from './middleware/auth';
// import 'dotenv/config';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const app = express();
// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(cors({ origin: "http://localhost:8080", credentials: true }));
// // your routes
// // app.post("/api/auth/login", login);
// app.use('/api/bookings', bookingRouter);
// app.use('/api/bookings', auth, bookingRouter);
// app.use('/api/auth', authRouter);
// app.get('/health', (_req, res) => res.json({ ok: true }));
// const PORT = Number(process.env.PORT ?? 3000);
// app.listen(PORT, () => {
//   console.log(`API running on http://localhost:${PORT}`);
// });
// export default app;
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
// ✅ Start server (for local development only)
const PORT = Number(process.env.PORT ?? 3000);
app_1.default.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
});
