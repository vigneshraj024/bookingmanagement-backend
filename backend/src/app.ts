import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bookingRouter from './Routes/bookingroutes';
import authRouter from './Routes/authroutes';
import { auth } from './middleware/auth';
import 'dotenv/config';

export const app = express();

// Security & Middleware
app.use(helmet());
// Allow all origins in Functions; keep credentials support
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);            // Public (login/register)
app.use('/api/bookings', auth, bookingRouter); // Protected (requires login)

app.get('/health', (_req, res) => res.json({ ok: true }));

export default app;
