'use strict';

const request = require('supertest');

// App is imported here; index.js must not auto-start the server when required.
// We export `app` from index.js without calling listen() in test env.
let app;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-must-be-at-least-32-chars-long!!';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-at-least-32-chars!!';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'postgresql://test:test@localhost:5432/contract_test';
  process.env.BCRYPT_ROUNDS = '10'; // Lower rounds for fast tests
  app = require('../src/index');
});

afterAll(async () => {
  const prisma = require('../src/config/db');
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('should return 201 and tokens for valid input', async () => {
    // TODO: implement with test DB seeding
  });

  it('should return 400 for missing fields', async () => {
    // TODO: implement
  });

  it('should return 409 for duplicate email', async () => {
    // TODO: implement
  });
});

describe('POST /api/auth/login', () => {
  it('should return 200 and access token for valid credentials', async () => {
    // TODO: implement
  });

  it('should return 401 for wrong password', async () => {
    // TODO: implement
  });

  it('should return 400 for invalid email format', async () => {
    // TODO: implement
  });
});

describe('POST /api/auth/refresh', () => {
  it('should rotate refresh token and return new access token', async () => {
    // TODO: implement
  });

  it('should return 401 if refresh token is missing', async () => {
    // TODO: implement
  });
});

describe('POST /api/auth/logout', () => {
  it('should revoke the refresh token', async () => {
    // TODO: implement
  });
});

describe('GET /api/auth/me', () => {
  it('should return the authenticated user profile', async () => {
    // TODO: implement
  });

  it('should return 401 without a valid access token', async () => {
    // TODO: implement
  });
});
