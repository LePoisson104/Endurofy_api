// Global test setup
import { jest } from "@jest/globals";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to silent console logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set timezone for consistent date testing
process.env.TZ = "UTC";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.DB_HOST = "localhost";
process.env.DB_USER = "test";
process.env.DB_PASSWORD = "test";
process.env.DB_NAME = "test_db";
