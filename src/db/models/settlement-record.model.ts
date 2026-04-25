/**
 * SettlementRecord Model
 *
 * Tracks the outcome of a periodic settlement run for a tenant.
 * Each record summarises the total points redeemed across all merchants
 * within the given period (C-011).
 *
 * Records are write-once append entries; corrections are compensating
 * records, never updates.
 *
 * Collection: settlement_records
 */

import mongoose, { Document, Schema } from 'mongoose';

export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'failed';

export const SETTLEMENT_STATUSES: ReadonlyArray<SettlementStatus> = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const;

export interface ISettlementRecord extends Document {
  settlement_id: string;
  tenant_id: string;
  period_start: Date;
  period_end: Date;
  total_redeemed: number;
  status: SettlementStatus;
  correlation_id: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SettlementRecordSchema = new Schema<ISettlementRecord>(
  {
    settlement_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    tenant_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    period_start: {
      type: Date,
      required: true,
      index: true,
    },
    period_end: {
      type: Date,
      required: true,
      index: true,
    },
    total_redeemed: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: [...SETTLEMENT_STATUSES],
      default: 'pending',
      index: true,
    },
    correlation_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2048,
    },
  },
  {
    timestamps: true,
    collection: 'settlement_records',
  },
);

// Lookup index for tenant + period range queries.
SettlementRecordSchema.index({ tenant_id: 1, period_start: -1, period_end: -1 });

// Prevent duplicate settlement runs for the same tenant + period.
SettlementRecordSchema.index({ tenant_id: 1, period_start: 1, period_end: 1 }, { unique: true });

export const SettlementRecordModel = mongoose.model<ISettlementRecord>(
  'SettlementRecord',
  SettlementRecordSchema,
);
