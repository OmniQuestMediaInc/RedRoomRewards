/**
 * jest.config.js — RedRoomRewards
 * Modern Jest configuration for Next.js 14+ / TypeScript projects.
 *
 * TODO: When Next.js app router is scaffolded, replace ts-jest with
 *   the official Next.js Jest transformer:
 *   https://nextjs.org/docs/app/building-your-application/testing/jest
 *
 * TODO: Add moduleNameMapper entries if path aliases are added to tsconfig.json
 */

/** @type {import('jest').Config} */
module.exports = {
  // ── Test Runner Setup ──────────────────────────────────────────────────
  preset: 'ts-jest',
  testEnvironment: 'node',

  // ── Test Discovery ─────────────────────────────────────────────────────
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],

  // ── Transforms ────────────────────────────────────────────────────────
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // ── Module Resolution ─────────────────────────────────────────────────
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // TODO: Add moduleNameMapper when tsconfig path aliases are configured:
  // moduleNameMapper: {
  //   '^@/(.*)$': '<rootDir>/src/$1',
  // },

  // ── Coverage ──────────────────────────────────────────────────────────
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/test-setup.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  // Coverage floor is pinned to current measured levels (A-011).
  // Target is 80% across the board; ratchet up, never down, as services
  // gain real test coverage (notably: admin-ops, idempotency, ingest-worker,
  // reservations, balance-snapshot-cache, receipt-endpoint.example).
  // Current gap vs. 80% target:
  //   statements 60.05% (-19.95), branches 48.8% (-31.2),
  //   lines 60.19% (-19.81),     functions 52.21% (-27.79)
  coverageThreshold: {
    global: {
      branches: 48,
      functions: 52,
      lines: 60,
      statements: 60,
    },
  },

  // ── Globals ───────────────────────────────────────────────────────────
  verbose: true,

  // ── Setup Files ───────────────────────────────────────────────────────
  // Mock uuid as a simple function returning predictable IDs in tests
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
};
