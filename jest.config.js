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
  coverageThreshold: {
    global: {
      // TODO: Raise thresholds gradually as coverage improves
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // ── Globals ───────────────────────────────────────────────────────────
  verbose: true,

  // ── Setup Files ───────────────────────────────────────────────────────
  // Mock uuid as a simple function returning predictable IDs in tests
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
};
