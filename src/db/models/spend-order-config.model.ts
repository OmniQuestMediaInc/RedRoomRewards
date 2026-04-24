/**
 * SpendOrderConfig Model
 *
 * Tenant-scoped, merchant-set burn order configuration for point redemption.
 * Controls which point_type is consumed first and how points within a type
 * are ordered for consumption.
 * Versioned via effective_at / superseded_at — never delete or update rows;
 * insert a new row and stamp superseded_at on the prior active row.
 *
 * Default within_type_order is "fifo_by_expires_at" — required for
 * expiration safety (earliest-expiring lots consumed first).
 *
 * Collection: spend_order_configs
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ISpendOrderConfig extends Document {
  config_id: string;
  tenant_id: string;
  merchant_id: string;
  effective_at: Date;
  superseded_at: Date | null;
  correlation_id: string;
  reason_code: string;
  created_by: string;
  point_type_priority: string[];
  within_type_order: 'fifo_by_expires_at' | 'fifo_by_awarded_at';
  createdAt: Date;
  updatedAt: Date;
}

export const SpendOrderConfigSchema = new Schema<ISpendOrderConfig>(
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
    // Ordered array of point_type values — first element is burned first (FIFO by type)
    point_type_priority: {
      type: [String],
      required: true,
    },
    // Order within a single point_type: consume earliest-expiring lots first (expiration safety)
    // or earliest-awarded lots first
    within_type_order: {
      type: String,
      required: true,
      enum: ['fifo_by_expires_at', 'fifo_by_awarded_at'],
      default: 'fifo_by_expires_at',
    },
  },
  {
    timestamps: true,
    collection: 'spend_order_configs',
  },
);

// Compound index for active-config lookup (tenant + merchant, newest first)
SpendOrderConfigSchema.index({ tenant_id: 1, merchant_id: 1, effective_at: -1 });

export const SpendOrderConfigModel = mongoose.model<ISpendOrderConfig>(
  'SpendOrderConfig',
  SpendOrderConfigSchema,
);
