/**
 * MerchantPairConfig Model
 *
 * Effective-dated cross-merchant exchange rate config per CEO
 * Decision B4 (cross-merchant rate 1:1 default via
 * MerchantPairConfig). Each row defines the rate at which points
 * earned at `from_merchant_id` are exchanged for points spendable
 * at `to_merchant_id` within a single tenant.
 *
 * Effective-dating: rows are immutable once written; superseding a
 * pair-rate inserts a new row and stamps `superseded_at` on the
 * prior active row. Active row at any instant `T` is the one with
 * `effective_at <= T < superseded_at` (where null superseded_at
 * means "still in force").
 *
 * Uniqueness: a unique partial index on
 * (tenant_id, from_merchant_id, to_merchant_id) WHERE
 * superseded_at IS NULL ensures only one active row per pair.
 *
 * Default rate: 1:1 (B4) — when no row exists, callers fall back
 * to a 1.0 multiplier; this model is the override surface.
 *
 * Collection: merchant_pair_configs
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IMerchantPairConfig extends Document {
  config_id: string;
  tenant_id: string;
  from_merchant_id: string;
  to_merchant_id: string;
  exchange_rate: number;
  effective_at: Date;
  superseded_at: Date | null;
  correlation_id: string;
  reason_code: string;
  created_by: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MerchantPairConfigSchema = new Schema<IMerchantPairConfig>(
  {
    config_id: {
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
    from_merchant_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    to_merchant_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    exchange_rate: {
      type: Number,
      required: true,
      min: 0,
    },
    effective_at: {
      type: Date,
      required: true,
      index: true,
    },
    superseded_at: {
      type: Date,
      required: false,
      default: null,
    },
    correlation_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    reason_code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
    },
    created_by: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
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
    collection: 'merchant_pair_configs',
  },
);

// Active-row lookup: tenant + pair, newest effective first.
MerchantPairConfigSchema.index({
  tenant_id: 1,
  from_merchant_id: 1,
  to_merchant_id: 1,
  effective_at: -1,
});

// Unique partial index — only one active (un-superseded) row per
// (tenant, from, to) tuple. Mongoose `partialFilterExpression` maps
// to a MongoDB partial index.
MerchantPairConfigSchema.index(
  { tenant_id: 1, from_merchant_id: 1, to_merchant_id: 1 },
  {
    unique: true,
    partialFilterExpression: { superseded_at: null },
  },
);

/**
 * Default cross-merchant exchange rate per CEO Decision B4 (1:1).
 * Callers SHOULD invoke `getDefaultExchangeRate()` rather than
 * hardcoding 1 — gives us a single update point if the default ever
 * changes by program decision.
 */
export const DEFAULT_CROSS_MERCHANT_EXCHANGE_RATE = 1.0;

export function getDefaultExchangeRate(): number {
  return DEFAULT_CROSS_MERCHANT_EXCHANGE_RATE;
}

export const MerchantPairConfigModel = mongoose.model<IMerchantPairConfig>(
  'MerchantPairConfig',
  MerchantPairConfigSchema,
);
