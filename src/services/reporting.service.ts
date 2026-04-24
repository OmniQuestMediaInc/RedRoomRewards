import { Injectable } from '@nestjs/common';
import { LiabilityReport } from '../interfaces/redroom-rewards';

@Injectable()
export class ReportingService {
  async getLiabilityReport(): Promise<LiabilityReport> {
    // Stub — real aggregation from ledger in production
    return {
      totalPromotionalIssued: 245000,
      totalBurned: 87000,
      outstandingLiability: 158000,
      asOf: new Date(),
    };
  }
}
