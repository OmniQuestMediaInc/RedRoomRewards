export enum RedRoomTier {
  RED_DESIRE = 'RED_DESIRE',
  RED_PASSION = 'RED_PASSION',
  RED_OBSESSION = 'RED_OBSESSION',
  RED_REIGN = 'RED_REIGN',
}

export interface GateGuardAVResult {
  verified: boolean;
  verifiedAt: Date;
  method: 'YOTI' | 'DOCUMENT_LIVENESS' | 'GATEGUARD';
  confidenceScore: number;
}

export interface AwardingWalletUploadRow {
  creatorId: string;
  points: number;
  reason: string;
  expiryDays?: number;
}

export interface AwardingWalletUploadResult {
  successCount: number;
  failedCount: number;
  errors: Array<{ row: number; error: string }>;
}

export interface MemberSignupRequest {
  email: string;
  password?: string;
  billingAddress?: unknown;
}

export interface MemberProfile {
  memberId: string;
  tier: RedRoomTier;
  totalPoints: number;
  promotionalBalance: number;
  verifiedAt: Date;
}
