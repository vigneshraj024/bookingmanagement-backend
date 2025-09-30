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
// CORS: Configure allowed origins based on environment
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = isProduction
  ? [
      'https://sports-booking-turf50.web.app', // Production frontend
      'https://sports-booking-turf50.firebaseapp.com', // Firebase auth domain
      'https://turf50-5a2f5.web.app', // Fallback Firebase domain
      'https://turf50-5a2f5.firebaseapp.com', // Fallback Firebase auth
    ]
  : [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Common dev port
      'http://127.0.0.1:5173', // Alternative localhost
      'http://127.0.0.1:3000', // Alternative localhost
      'http://localhost:4173', // Vite preview
      process.env.FRONTEND_ORIGIN,
    ];

// Add any additional origins from environment variables
const additionalOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

const finalAllowedOrigins = [...new Set([...allowedOrigins, ...additionalOrigins])].filter(Boolean) as string[];

// Log allowed origins for debugging
console.log('Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins for easier testing
    if (!isProduction) {
      console.log(`Allowing request from: ${origin}`);
      return callback(null, true);
    }
    
    // In production, only allow whitelisted origins
    if (finalAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn('Blocked by CORS:', origin);
    console.warn('Allowed origins:', finalAllowedOrigins);
    return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 86400, // 24 hours
};

// Apply CORS with the defined options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);            // Public (login/register)
app.use('/api/bookings', auth, bookingRouter); // Protected (requires login)
app.use('/api/admins', auth, adminRouter);     // Admin management
app.use('/api/prices', auth, priceRouter);     // Price master
app.use('/api/audits', auth, auditRouter);     // Audit logs query

app.get('/health', (_req, res) => res.json({ ok: true }));

export default app;
