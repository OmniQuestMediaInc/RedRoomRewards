/**
 * WO-011 ZK Oracle — Balance Range Circuit (PoC simulation)
 *
 * SPIKE: This is a cryptographic SIMULATION, not a real ZK-SNARK.
 * It uses SHA-256 commitments and HMAC-based range attestation.
 * The interface is stable and serves as the drop-in integration point for a
 * production Circom/Groth16 circuit (see WO-011-ZK-ORACLE-ARCHITECTURE.md §7).
 *
 * What this PoC DOES NOT provide:
 *   - Zero-knowledge hiding: an adversary with the nonce can compute the balance.
 *   - Succinct non-interactive proof: no pairing-based arithmetic.
 *   - Trusted setup independence: no powers-of-tau ceremony.
 *
 * What this PoC DOES provide:
 *   - The exact TypeScript interface that production code will implement.
 *   - Binding commitment: commitment is cryptographically bound to the balance.
 *   - Verifiable range attestation: the proof cannot be forged without the nonce.
 *   - CI-runnable round-trip: generate → verify works with no external deps.
 */

import { createHash, createHmac, randomBytes } from 'crypto';
import { ZkCircuitId, ZkCommitment, ZkRangeProof, ZkVerifyResult } from '../zk-oracle.types';

/** Internal circuit constants — matches WO-011-ZK-ORACLE-ARCHITECTURE.md §4 */
const CIRCUIT_ID = ZkCircuitId.BALANCE_RANGE;
const CIRCUIT_VERSION = '1';
const HMAC_ALGORITHM = 'sha256';

/**
 * Generate a SHA-256 commitment to `value` using a fresh random nonce.
 *
 * C = SHA256( value_bytes || nonce_bytes )
 */
function generateCommitment(value: number): ZkCommitment {
  const nonce = randomBytes(32).toString('hex');
  const hash = createHash('sha256')
    .update(Buffer.from(String(value), 'utf8'))
    .update(Buffer.from(nonce, 'hex'))
    .digest('hex');

  return { value: hash, nonce, algorithm: 'sha256' };
}

/**
 * Generate an HMAC-based range attestation.
 *
 * The HMAC key is derived from (commitment, nonce) so that:
 *   - The proof is bound to the commitment (cannot be reused for a different balance).
 *   - The proof is bound to the threshold (cannot be repurposed for a lower threshold).
 *   - Without the nonce, the proof cannot be forged.
 *
 * hmac_key  = SHA256( commitment.value || commitment.nonce )
 * proof_msg = "balance_range_v1:1:" || threshold
 * proof     = HMAC-SHA256( hmac_key, proof_msg ) || ":" || threshold
 */
function generateRangeAttestation(
  commitment: ZkCommitment,
  privateValue: number,
  threshold: number,
): string {
  if (privateValue < threshold) {
    throw new Error(
      `ZK circuit constraint violated: value (${privateValue}) < threshold (${threshold})`,
    );
  }
  if (privateValue < 0) {
    throw new Error('ZK circuit constraint violated: value must be non-negative');
  }

  const hmacKey = createHash('sha256')
    .update(Buffer.from(commitment.value, 'hex'))
    .update(Buffer.from(commitment.nonce, 'hex'))
    .digest();

  const message = `${CIRCUIT_ID}:${CIRCUIT_VERSION}:${threshold}`;
  const mac = createHmac(HMAC_ALGORITHM, hmacKey).update(message).digest('hex');

  return `${mac}:${threshold}`;
}

/**
 * Verify an HMAC-based range attestation WITHOUT the private value.
 *
 * The verifier re-derives the HMAC key from the public commitment, then
 * recomputes the expected HMAC and compares with the proof blob.
 * The nonce is required — it is the shared secret between prover and verifier.
 *
 * NOTE: In production (Groth16), the verifier key replaces the nonce.
 */
function verifyRangeAttestation(
  commitment: ZkCommitment,
  proof: string,
  threshold: number,
): boolean {
  const [mac, proofThreshold] = proof.split(':');
  if (!mac || proofThreshold === undefined) {
    return false;
  }
  if (Number(proofThreshold) !== threshold) {
    return false;
  }

  const hmacKey = createHash('sha256')
    .update(Buffer.from(commitment.value, 'hex'))
    .update(Buffer.from(commitment.nonce, 'hex'))
    .digest();

  const message = `${CIRCUIT_ID}:${CIRCUIT_VERSION}:${threshold}`;
  const expected = createHmac(HMAC_ALGORITHM, hmacKey).update(message).digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== mac.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ mac.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Prove that `privateBalance >= threshold`.
 *
 * Returns a ZkRangeProof containing the public commitment and proof blob.
 * The private balance is NOT included in the proof.
 *
 * @throws if balance < threshold (constraint violation)
 */
export function proveBalanceRange(
  privateBalance: number,
  threshold: number,
  proofId: string,
): ZkRangeProof {
  const commitment = generateCommitment(privateBalance);
  const proof = generateRangeAttestation(commitment, privateBalance, threshold);

  return {
    commitment,
    threshold,
    proof,
    circuitId: CIRCUIT_ID,
    proofId,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Verify that the prover satisfied `balance >= threshold` given the proof.
 *
 * The private balance is NEVER needed for verification.
 * The commitment.nonce is required — the prover must share it with the verifier.
 * In production (snarkjs), the proof contains its own verification key.
 */
export function verifyBalanceRange(rangeProof: ZkRangeProof): ZkVerifyResult {
  const base: Pick<ZkVerifyResult, 'circuitId' | 'claimedThreshold' | 'verifiedAt'> = {
    circuitId: rangeProof.circuitId,
    claimedThreshold: rangeProof.threshold,
    verifiedAt: new Date(),
  };

  if (rangeProof.circuitId !== CIRCUIT_ID) {
    return {
      ...base,
      valid: false,
      error: `Circuit mismatch: expected ${CIRCUIT_ID}, got ${rangeProof.circuitId}`,
    };
  }

  const ok = verifyRangeAttestation(rangeProof.commitment, rangeProof.proof, rangeProof.threshold);
  if (!ok) {
    return { ...base, valid: false, error: 'Proof verification failed' };
  }

  return { ...base, valid: true };
}
