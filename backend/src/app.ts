import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bookingRouter from './Routes/bookingroutes.js';
import authRouter from './Routes/authroutes.js';
import { auth } from './middleware/auth.js';
import adminRouter from './Routes/adminroutes.js';
import priceRouter from './Routes/priceroutes.js';
import auditRouter from './Routes/auditroutes.js';
import 'dotenv/config';

export const app = express();

// Security & Middleware
app.use(helmet());
// CORS: allow only configured frontends (plus local dev)
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.FRONTEND_ORIGIN_2,
  'http://localhost:5173', // Vite default
  'http://localhost:3000', // CRA default
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Handle preflight requests
app.options('*', cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);            // Public (login/register)
app.use('/api/bookings', auth, bookingRouter); // Protected (requires login)
app.use('/api/admins', auth, adminRouter);     // Admin management
app.use('/api/prices', auth, priceRouter);     // Price master
app.use('/api/audits', auth, auditRouter);     // Audit logs query

app.get('/health', (_req, res) => res.json({ ok: true }));

export default app;
