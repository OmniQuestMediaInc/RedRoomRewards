import { Injectable } from '@nestjs/common';
import {
  MerchantPairConfigModel,
  getDefaultExchangeRate,
} from '../db/models/merchant-pair-config.model';

/**
 * CrossMerchantExchangeService
 *
 * Resolves the point exchange rate between two merchants within a tenant,
 * using the effective-dated MerchantPairConfig records (B-007).
 *
 * CEO Decision B4: default 1:1 rate when no active row is found.
 *
 * Effective row selection:
 *   - effective_at <= now
 *   - superseded_at IS NULL  (active row — unique partial index guarantees
 *     at most one per (tenant, from, to) pair)
 */
@Injectable()
export class CrossMerchantExchangeService {
  /**
   * Returns the active exchange rate for converting points earned at
   * `fromMerchantId` to points spendable at `toMerchantId` within
   * `tenantId`.  Falls back to 1.0 (CEO Decision B4) when no active row
   * is found.
   */
  async getExchangeRate(
    tenantId: string,
    fromMerchantId: string,
    toMerchantId: string,
  ): Promise<number> {
    const config = await MerchantPairConfigModel.findOne({
      tenant_id: tenantId,
      from_merchant_id: fromMerchantId,
      to_merchant_id: toMerchantId,
      effective_at: { $lte: new Date() },
      superseded_at: null,
    }).lean();

    if (!config) {
      return getDefaultExchangeRate();
    }
    return config.exchange_rate;
  }
}
