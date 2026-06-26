import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { connectDB, sequelize } from './config/database.js';

import { errorHandler } from './middlewares/error.middleware.js';

// routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { clientRoutes } from './modules/clients/client.routes.js';
import { caseRoutes } from './modules/cases/case.routes.js';
import { documentRoutes } from './modules/documents/document.routes.js';
import { taskRoutes } from './modules/tasks/task.routes.js';
import { financeRoutes } from './modules/finance/finance.routes.js';
import { searchRoutes } from './modules/search/search.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { eventRoutes } from './modules/events/event.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { meetingRoutes } from './modules/meetings/meeting.routes.js';

const app = express();

app.get("/", (req, res) => {
  res.json({ status: "API running" });
});
// ---------------- SECURITY ----------------
app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

// ---------------- LOGGING ----------------
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ---------------- CORS ----------------
app.use(cors({
  origin: config.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ---------------- BODY ----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------- HEALTH ----------------
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API running',
    time: new Date().toISOString(),
  });
});

// ---------------- DB TEST ----------------
app.get("/db-test", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "DB OK - Neon connected" });
  } catch (err) {
    res.status(500).json({ status: "DB FAIL", error: err.message });
  }
});

// ---------------- ROUTES ----------------
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/meetings', meetingRoutes);

// ---------------- 404 ----------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ---------------- ERROR HANDLER ----------------
app.use(errorHandler);

// ---------------- DB INIT (SAFE) ----------------
const startDB = async () => {
  try {
    await connectDB();
    console.log("DB CONNECTED");
  } catch (err) {
    console.log("DB ERROR:", err.message);
  }
};

startDB();

export { app };
