'use strict';

// Load and validate env vars FIRST — app fails fast if any are missing
require('dotenv').config();
const env = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const contractRoutes = require('./routes/contract.routes');
const errorHandler = require('./middlewares/errorHandler');
const { sendError } = require('./utils/response');

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// Security & Logging Middleware
// ─────────────────────────────────────────────────────────────────────────────

app.set('trust proxy', 1); // Required for accurate IP behind Render/Nginx

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // Required for HttpOnly cookie to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// HTTP request logger — compact in production, verbose in development
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─────────────────────────────────────────────────────────────────────────────
// Body Parsing
// ─────────────────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  sendError(res, { status: 404, code: 'NOT_FOUND', message: 'Route not found' });
});

// ─────────────────────────────────────────────────────────────────────────────
// Global Error Handler — must be last
// ─────────────────────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────

const server = app.listen(env.PORT, () => {
  console.log(`[server] Running on port ${env.PORT} (${env.NODE_ENV})`);
});

// Graceful shutdown — close DB connections before exit
const prisma = require('./config/db');

async function shutdown(signal) {
  console.log(`[server] ${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[server] Database disconnected. Exiting.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app; // Exported for supertest
