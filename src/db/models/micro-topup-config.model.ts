/**
 * MicroTopupConfig Model
 *
 * Tenant-scoped, merchant-set micro top-up threshold and amount configuration.
 * A micro top-up is a small point credit that unblocks a redemption threshold
 * when a member's balance falls below the configured trigger level.
 * Versioned via effective_at / superseded_at — never delete or update rows;
 * insert a new row and stamp superseded_at on the prior active row.
 * Collection: micro_topup_configs
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IMicroTopupConfig extends Document {
  config_id: string;
  tenant_id: string;
  merchant_id: string;
  effective_at: Date;
  superseded_at: Date | null;
  correlation_id: string;
  reason_code: string;
  created_by: string;
  threshold_points: number;
  topup_points: number;
  max_topups_per_period: number;
  period_seconds: number;
  createdAt: Date;
  updatedAt: Date;
}

export const MicroTopupConfigSchema = new Schema<IMicroTopupConfig>(
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
    merchant_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
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
    // Trigger micro top-up when member balance falls below this value
    threshold_points: {
      type: Number,
      required: true,
      min: 0,
    },
    // Points to credit when the trigger fires
    topup_points: {
      type: Number,
      required: true,
      min: 0,
    },
    // Maximum number of top-ups allowed within the configured period
    max_topups_per_period: {
      type: Number,
      required: true,
      min: 0,
    },
    // Length of the rate-limiting period in seconds
    period_seconds: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'micro_topup_configs',
  }
);

// Compound index for active-config lookup (tenant + merchant, newest first)
MicroTopupConfigSchema.index({ tenant_id: 1, merchant_id: 1, effective_at: -1 });

export const MicroTopupConfigModel = mongoose.model<IMicroTopupConfig>(
  'MicroTopupConfig',
  MicroTopupConfigSchema
);
