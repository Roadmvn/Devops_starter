require('dotenv').config({ path: '.env.test' });

// Configuration globale pour les tests
jest.setTimeout(10000); // 10 secondes timeout

// Mock pour winston logger
jest.mock('./utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  stream: { write: jest.fn() }
}));
