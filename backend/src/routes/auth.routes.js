'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const env = require('../config/env');

const router = Router();

// ── Rate limiting ────────────────────────────────────────────────────────────
// Applied only to the auth mutation endpoints.
// The limiter store is intentionally injected via the factory so it can be
// swapped to Redis (rate-limit-redis + ioredis) without touching this file.
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,  // Return RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
    },
  },
  // store: new RedisStore({ client: redisClient }) — swap here for production
});

// ── Routes ───────────────────────────────────────────────────────────────────

// Public
router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);  // Auth via HttpOnly cookie

// Protected
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;
