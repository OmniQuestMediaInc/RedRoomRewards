/**
 * ZK Oracle — TypeScript types (WO-011 research spike)
 *
 * These interfaces define the stable contract between the PoC simulation and
 * the future production Circom/snarkjs replacement.  Do NOT change field names
 * without a corresponding spec amendment in WO-011-ZK-ORACLE-ARCHITECTURE.md.
 */

/** Cryptographic commitment to a private value (balance, score, etc.). */
export interface ZkCommitment {
  /** hex-encoded SHA-256 commitment: SHA256(value || nonce) */
  value: string;
  /** random nonce used in the commitment (hex-encoded, 32 bytes) */
  nonce: string;
  /** commitment algorithm — 'sha256' in PoC; 'poseidon' in production */
  algorithm: 'sha256' | 'poseidon';
}

/**
 * Range proof: proves `private_value >= threshold` without revealing
 * `private_value`.  The `commitment` cryptographically binds the prover to
 * their claimed private value.
 */
export interface ZkRangeProof {
  commitment: ZkCommitment;
  /** The minimum threshold the prover claims to satisfy */
  threshold: number;
  /** hex-encoded proof blob (HMAC attestation in PoC; Groth16 in production) */
  proof: string;
  /** Identifies which circuit/version produced this proof */
  circuitId: ZkCircuitId;
  /** Unique proof identifier for audit trail correlation */
  proofId: string;
  /** ISO timestamp of proof generation */
  generatedAt: string;
}

/** Supported circuit identifiers. */
export enum ZkCircuitId {
  /** Proves balance >= threshold (P0 — required for redemption) */
  BALANCE_RANGE = 'balance_range_v1',
  /** Proves tier >= claimed tier level (P1) */
  TIER_MEMBERSHIP = 'tier_membership_v1',
  /** Proves WGS action == PASS (P2 — deferred until WO-006 exits stub) */
  WGS_PASS_GATE = 'wgs_pass_gate_v1',
}

/** Result of verifying a ZkRangeProof. */
export interface ZkVerifyResult {
  valid: boolean;
  circuitId: ZkCircuitId;
  /** The threshold the proof was generated against */
  claimedThreshold: number;
  verifiedAt: Date;
  /** Populated when valid === false */
  error?: string;
}

/** Audit record written for every proof generation. */
export interface ZkProofAuditRecord {
  proofId: string;
  circuitId: ZkCircuitId;
  /** Public threshold value — NOT the private balance */
  threshold: number;
  /** Public commitment — binds to the private value cryptographically */
  commitment: string;
  generatedAt: string;
  /** LedgerEntry correlation_id if this proof is associated with a transaction */
  correlationId?: string;
}
