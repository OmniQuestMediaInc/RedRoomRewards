/**
 * ValuationConfig Model
 *
 * Tenant-scoped, merchant-set point-to-currency valuation configuration.
 * Versioned via effective_at / superseded_at — never delete or update rows;
 * insert a new row and stamp superseded_at on the prior active row.
 * Collection: valuation_configs
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IValuationConfig extends Document {
  config_id: string;
  tenant_id: string;
  merchant_id: string;
  effective_at: Date;
  superseded_at: Date | null;
  correlation_id: string;
  reason_code: string;
  created_by: string;
  point_type: 'purchase' | 'promo' | 'gifted' | 'model_allocation';
  cents_per_point: number;
  currency_code: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ValuationConfigSchema = new Schema<IValuationConfig>(
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
    point_type: {
      type: String,
      required: true,
      enum: ['purchase', 'promo', 'gifted', 'model_allocation'],
    },
    cents_per_point: {
      type: Number,
      required: true,
      min: 0,
    },
    currency_code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3, // ISO 4217 — e.g. "USD", "CAD"
    },
  },
  {
    timestamps: true,
    collection: 'valuation_configs',
  },
);

// Compound index for active-config lookup (tenant + merchant, newest first)
ValuationConfigSchema.index({ tenant_id: 1, merchant_id: 1, effective_at: -1 });

export const ValuationConfigModel = mongoose.model<IValuationConfig>(
  'ValuationConfig',
  ValuationConfigSchema,
);
