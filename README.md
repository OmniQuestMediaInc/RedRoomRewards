# RedRoomRewards

**A Ledger-Based Loyalty and Rewards Platform**

[![CodeQL](https://github.com/OmniQuestMedia/RedRoomRewards/workflows/CodeQL/badge.svg)](https://github.com/OmniQuestMedia/RedRoomRewards/actions/workflows/codeql.yml)

---

## Overview

RedRoomRewards is a standalone loyalty and rewards platform that manages user loyalty points through a robust, auditable ledger system. Built with Node.js and TypeScript, it provides secure APIs for point management, wallet operations, and comprehensive transaction tracking.

### Key Features

- **Immutable Ledger**: All transactions recorded with full audit trails
- **Wallet Management**: User point balances with optimistic locking
- **Idempotent Operations**: Safe retries and duplicate request handling
- **API-First Design**: Well-defined OpenAPI contract
- **Security Focused**: Authentication, validation, and compliance-ready

---

## Architecture

RedRoomRewards follows a clean, canonical structure optimized for a loyalty platform:

```
/api/          # OpenAPI specifications
/src/          # Application source (ledger, wallets, services, webhooks)
/infra/        # Infrastructure (migrations, db, config)
/docs/         # Documentation
/.github/      # CI/CD workflows
```

**Key Architectural Principles:**
- Server-side authority for all business logic
- Immutable audit trails with 7+ year retention
- Clear API boundaries with external systems
- Facts-based integration (not logic-based)

For detailed architecture, see [`/docs/UNIVERSAL_ARCHITECTURE.md`](/docs/UNIVERSAL_ARCHITECTURE.md).

---

## Current Status

**Phase**: Core Implementation Complete (v0.2.0)

All core modules are **implemented and tested** with comprehensive functionality.

### What's Ready
- ✅ Canonical directory structure
- ✅ OpenAPI contract specification (`/api/openapi.yaml`)
- ✅ Architecture documentation
- ✅ Security and governance policies
- ✅ CI/CD workflows (CodeQL, Dependabot)
- ✅ **Ledger module** - Immutable transaction logging
- ✅ **Wallet module** - Balance management with escrow
- ✅ **Business logic services** - Point accrual, redemption, expiration, admin ops
- ✅ Database models and migrations
- ✅ Comprehensive unit tests (46 passing)
- ✅ Security scan (0 vulnerabilities)

### Core Modules

#### Ledger Module
Immutable, append-only event store for all point/balance changes:
- All mutations are new entries; no destructive edits
- Atomic, idempotent operations with full audit trails
- 7-year retention compliance
- Point-in-time balance snapshots
- Reconciliation reporting

#### Wallet Module
Per-user and model wallets with optimistic locking:
- Three-state balance tracking (available/escrow/earned)
- Version-based concurrency control
- Queue-authorized settlement/refund
- No double-spend exposure
- Safeguards around balance updates

#### Business Logic Services
Domain services strictly separated from client/UI/auth logic:
- **PointAccrualService**: Signup bonuses, referrals, promotions, admin credits
- **PointRedemptionService**: Escrow holds for chip menu and performances
- **PointExpirationService**: Scheduled expiration with batch processing
- **AdminOpsService**: Manual adjustments, refunds, balance corrections

### What's Next
- 🔄 API endpoint implementation (controllers and routes)
- 🔄 Queue service for settlement authority
- 🔄 Integration tests for end-to-end flows
- 🔄 External system integration adapters
- 🔄 Rate limiting and throttling
- 🔄 Production deployment configuration

---

## Quick Start

> **Note**: Implementation is not yet complete. These instructions are placeholders for future development.

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6+
- TypeScript 5+

### Installation

```bash
# Clone repository
git clone https://github.com/OmniQuestMedia/RedRoomRewards.git
cd RedRoomRewards

# Install dependencies (when package.json exists)
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations (when implemented)
npm run migrate

# Start development server (when implemented)
npm run dev
```

---

## Documentation

- **[Universal Architecture](/docs/UNIVERSAL_ARCHITECTURE.md)** - Architectural principles and prohibitions
- **[Security Policy](/SECURITY.md)** - Security guidelines and vulnerability reporting
- **[Contributing Guide](/CONTRIBUTING.md)** - How to contribute to the project
- **[Decisions Log](/docs/DECISIONS.md)** - Key architectural decisions and rationale
- **[Copilot Governance](/docs/governance/COPILOT_GOVERNANCE.md)** - AI development rules and standards
- **[API Contract](/api/openapi.yaml)** - OpenAPI specification

---

## Development Guidelines

### Core Principles

1. **Financial Integrity**: All point transactions treated as financial operations
2. **Immutability**: Ledger entries are write-once, corrections are new transactions
3. **Idempotency**: All operations use idempotency keys
4. **Testing**: Comprehensive tests for all financial logic (mandatory human review)
5. **Security**: Server-side validation, no secrets in code, audit logging

### Technology Stack

- **Runtime**: Node.js with TypeScript (strict mode)
- **Database**: MongoDB with Mongoose ODM
- **API Style**: REST with OpenAPI 3.0
- **Testing**: Jest for unit/integration tests
- **CI/CD**: GitHub Actions (CodeQL)

For detailed development rules, see [`COPILOT_GOVERNANCE.md`](/docs/governance/COPILOT_GOVERNANCE.md).

---

## Prohibitions

⚠️ **CRITICAL**: The following are strictly forbidden:

- **NO legacy archived code** may be used (legacy archive removed per CEO Decision D1)
- **NO runtime UI, chat, broadcast, or tipping code** in this repository
- **NO game logic or RNG implementations** (external systems provide facts)
- **NO secrets or credentials** committed to source control

See [`/docs/UNIVERSAL_ARCHITECTURE.md`](/docs/UNIVERSAL_ARCHITECTURE.md) Section 2 for details.

---

## API Documentation

API contract: [`/api/openapi.yaml`](/api/openapi.yaml)

### Key Endpoints (Scaffolded)

- `GET /health` - Health check
- `GET /ledger/transactions` - List transactions
- `GET /wallets/{userId}` - Get wallet balance

Full implementation pending. See OpenAPI spec for complete contract.

---

## Contributing

We welcome contributions! Please see [`CONTRIBUTING.md`](/CONTRIBUTING.md) for:
- Code of conduct
- Development workflow
- PR submission guidelines
- Testing requirements

---

## Security

Security is our top priority. RedRoomRewards follows industry best practices and has undergone comprehensive security review.

**Latest Security Audit**: January 4, 2026  
**Status**: ✅ APPROVED (A+ Rating: 95/100)  
**CodeQL Scan**: 0 vulnerabilities found

### Security Documentation

- **[Security Policy](/SECURITY.md)** - Overview and vulnerability reporting
- **[Security Best Practices](/docs/security/SECURITY_BEST_PRACTICES.md)** - Developer guide (mandatory reading)
- **[Security Audit Policy](/docs/security/SECURITY_AUDIT_AND_NO_BACKDOOR_POLICY.md)** - Complete framework
- **[Latest Security Review](/docs/security/COMPREHENSIVE_SECURITY_REVIEW_2026-01-04.md)** - Detailed audit results

### Key Security Features

✅ **No Hardcoded Secrets**: All credentials from environment variables  
✅ **Strong Authentication**: JWT with expiration, minimum 256-bit secrets  
✅ **Input Validation**: Server-side validation against injection attacks  
✅ **Idempotency**: Prevents double-spend and replay attacks  
✅ **Race Protection**: Optimistic locking on concurrent operations  
✅ **PII Protection**: No personally identifiable information in logs  
✅ **Audit Trails**: Immutable ledger for all financial operations  
✅ **No Backdoors**: No bypass mechanisms or debug endpoints in production

### For Developers

**⚠️ NEVER commit secrets.** Use environment variables or secret management systems.

See [`.env.example`](/.env.example) for required environment variables and [SECURITY_BEST_PRACTICES.md](/docs/security/SECURITY_BEST_PRACTICES.md) for detailed security guidelines.

**Security Contact**: security@omniquestmedia.com

---

## License

This project is licensed under the MIT License - see [`LICENSE`](/LICENSE) for details.

---

## Support and Contact

- **Issues**: [GitHub Issues](https://github.com/OmniQuestMedia/RedRoomRewards/issues)
- **Documentation**: [`/docs/`](/docs/)
- **Governance**: [`COPILOT_GOVERNANCE.md`](/docs/governance/COPILOT_GOVERNANCE.md)

---

## Changelog

### 2025-12-15 - v0.1.0 (Foundation)
- Repository cleanup and restructure per work order
- Established canonical directory structure
- Created OpenAPI contract specification
- Documented universal architecture and prohibitions
- Archived legacy code (no reuse permitted)
- Added governance and compliance documentation

See [`DECISIONS.md`](/docs/DECISIONS.md) for detailed decision history.

---

**Built with integrity. Operated with transparency. Secured by design.**
