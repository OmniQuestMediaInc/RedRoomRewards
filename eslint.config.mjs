/**
 * ESLint Flat Config — RedRoomRewards
 * Modern Next.js 14+ / TypeScript / React ruleset.
 *
 * ESLint 10+ requires the flat config format (eslint.config.mjs).
 * The legacy .eslintrc.js at the root is a reference copy for ESLint 8/9.
 *
 * TODO: Add `eslint-config-next` when Next.js app router is scaffolded:
 *   import nextPlugin from '@next/eslint-plugin-next';
 *   import reactPlugin from 'eslint-plugin-react';
 *   import reactHooksPlugin from 'eslint-plugin-react-hooks';
 */

import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  // ── Global ignores ──────────────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.next/**',
      'out/**',
      'build/**',
      'LEGACY_CONFIGS/**',
      '*.js',
      '*.mjs',
      '*.cjs',
    ],
  },

  // ── TypeScript source files ──────────────────────────────────────────────
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'api/**/*.ts', 'api/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        // TODO: Enable project-aware linting once tsconfig paths are stable:
        // project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript recommended ruleset
      ...tseslint.configs.recommended.rules,

      // Downgrade to warnings to avoid blocking CI on gradual adoption.
      // With --max-warnings 0 these are still a hard gate; promote to error incrementally.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-require-imports': 'warn',

      // Broadly-firing rules from recommended — keep as warn until codebase is clean.
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',

      // Logging is intentional in this service layer
      'no-console': 'off',

      // TODO: Promote these to error once codebase reaches full type coverage:
      // '@typescript-eslint/no-explicit-any': 'error',
      // '@typescript-eslint/no-unused-vars': 'error',
    },
  },
];
