# LEGACY_CONFIGS

This directory contains the original root-level configuration and lint files
archived on **2026-04-19** as part of the config refresh:

> "Replace all root config/lint files with modern Next.js defaults, archive legacy configs"

## Purpose

These files are retained for:
- Audit and compliance history
- Recovery if a modern config introduces a regression
- Reference when tuning new configs

## Archived Files

| File                   | Description                                |
|------------------------|--------------------------------------------|
| `.env.example`         | Legacy environment variable template        |
| `.gitattributes`       | Legacy git merge strategies / line endings  |
| `.gitignore`           | Legacy version control exclusions           |
| `.markdownlintignore`  | Legacy markdown lint ignore patterns        |
| `eslint.config.mjs`    | Legacy ESLint flat config (ESLint 10)       |
| `jest.config.js`       | Legacy Jest test configuration              |
| `package-lock.json`    | Legacy npm lockfile snapshot                |
| `package.json`         | Legacy package manifest                     |
| `tsconfig.json`        | Legacy TypeScript compiler settings         |
| `validate-schema.js`   | Legacy JSON schema validation utility       |

## Do Not Delete

These files must not be removed without an explicit authorization from the
project owner (OmniQuest Media Inc.).
