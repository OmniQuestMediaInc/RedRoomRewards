/**
 * PointLot Model
 *
 * Represents an individual award batch of RRR Points with its own expiry.
 * Used by PointAccrualService, PointRedemptionService, and PointExpirationService
 * to track awarded/remaining balances and enforce FIFO expiration order.
 * Collection: point_lots
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IPointLot extends Document {
  lot_id: string;
  wallet_id: string;
  point_type: 'purchase' | 'promo' | 'gifted' | 'model_allocation';
  points_awarded: number;
  points_remaining: number;
  awarded_at: Date;
  expires_at: Date;
  source_event_id: string;
  promo_id?: string | null;
  correlation_id: string;
  reason_code: string;
  tenant_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PointLotSchema = new Schema<IPointLot>(
  {
    lot_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    wallet_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    point_type: {
      type: String,
      required: true,
      enum: ['purchase', 'promo', 'gifted', 'model_allocation'],
    },
    points_awarded: {
      type: Number,
      required: true,
      min: 0,
    },
    points_remaining: {
      type: Number,
      required: true,
      min: 0,
    },
    awarded_at: {
      type: Date,
      required: true,
      index: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: true,
    },
    source_event_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    promo_id: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: 128,
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
    tenant_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'point_lots',
  }
);

// Compound index for FIFO expiration sweeps
PointLotSchema.index({ wallet_id: 1, expires_at: 1 });

// Compound index for tenant-scoped lookups
PointLotSchema.index({ tenant_id: 1, wallet_id: 1 });

// Pre-save validator: points_remaining must never exceed points_awarded
PointLotSchema.pre('save', function () {
  if (this.points_remaining > this.points_awarded) {
    throw new Error(
      `points_remaining (${this.points_remaining}) must not exceed points_awarded (${this.points_awarded})`
    );
  }
});

export const PointLotModel = mongoose.model<IPointLot>('PointLot', PointLotSchema);
