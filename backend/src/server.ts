// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import bookingRouter from './Routes/bookingroutes';
// import authRouter from './Routes/authroutes';
// import { auth } from './middleware/auth';
// import 'dotenv/config';


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

// ✅ Production-ready server configuration
import 'dotenv/config';
import app from './app.js';

// ✅ Use dynamic port for deployment platforms (Render, Heroku, etc.)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  console.log(`🌐 Server ready to accept connections`);
});

export default app;
