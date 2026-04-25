#!/usr/bin/env node
/**
 * D-002 — OpenAPI Drift Check (stub)
 *
 * Verifies that the OpenAPI spec at api/openapi.yaml has not drifted from
 * the live controller surface. Currently a stub that exits 0; full
 * implementation will diff the spec against express-openapi-validator's
 * generated schema once the controller surface is stable.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const specPath = path.resolve(__dirname, '../../api/openapi.yaml');

if (!fs.existsSync(specPath)) {
  console.error('❌ OpenAPI spec not found at api/openapi.yaml');
  process.exit(1);
}

console.log('✅ OpenAPI drift check passed (stub for D-002)');
process.exit(0);
