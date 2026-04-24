/**
 * IdentityLink Model
 *
 * Binds a RRR LoyaltyAccount to a merchant-side external identity.
 * One LoyaltyAccount may carry multiple links (one per merchant);
 * every link is unique within (tenant_id, merchant_id, external_id)
 * to prevent the same merchant identity from binding to two RRR
 * accounts.
 *
 * Distinct from the existing `account_links` collection
 * (account-link.model.ts), which represents an SSO bind between RRR
 * and a single external system. IdentityLink is the per-merchant
 * mapping table used by the cross-merchant exchange service
 * (Wave C) to find the user's RRR loyalty account from a
 * merchant-facing identifier.
 *
 * Collection: identity_links
 */

import mongoose, { Document, Schema } from 'mongoose';

export type IdentityLinkStatus = 'active' | 'revoked';
export type IdentityLinkProvider = 'sso' | 'webhook' | 'manual';

export interface IIdentityLink extends Document {
  link_id: string;
  tenant_id: string;
  merchant_id: string;
  account_id: string;
  external_id: string;
  provider: IdentityLinkProvider;
  status: IdentityLinkStatus;
  bound_at: Date;
  revoked_at?: Date | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export const IdentityLinkSchema = new Schema<IIdentityLink>(
  {
    link_id: {
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
    account_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },
    external_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 256,
    },
    provider: {
      type: String,
      required: true,
      enum: ['sso', 'webhook', 'manual'],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'revoked'],
      default: 'active',
      index: true,
    },
    bound_at: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    revoked_at: {
      type: Date,
      required: false,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'identity_links',
  },
);

// Uniqueness — (tenant_id, merchant_id, external_id) prevents the
// same merchant identity from binding to two RRR loyalty accounts.
IdentityLinkSchema.index({ tenant_id: 1, merchant_id: 1, external_id: 1 }, { unique: true });
// (tenant_id, account_id, merchant_id) ensures one link per
// (member, merchant) pair within a tenant.
IdentityLinkSchema.index({ tenant_id: 1, account_id: 1, merchant_id: 1 }, { unique: true });
IdentityLinkSchema.index({ tenant_id: 1, status: 1 });

export const IdentityLinkModel = mongoose.model<IIdentityLink>('IdentityLink', IdentityLinkSchema);
