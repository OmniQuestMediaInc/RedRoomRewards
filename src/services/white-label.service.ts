import { Injectable } from '@nestjs/common';
import { WhiteLabelConfig } from '../interfaces/redroom-rewards';

@Injectable()
export class WhiteLabelService {
  private configs = new Map<string, WhiteLabelConfig>();

  async getConfig(merchantId: string): Promise<WhiteLabelConfig> {
    // Stub — real config from DB in production
    return (
      this.configs.get(merchantId) || {
        merchantId,
        brandName: 'Default Merchant',
        primaryColor: '#4c1d95',
        serviceBureauMode: true,
      }
    );
  }

  async saveConfig(config: WhiteLabelConfig): Promise<void> {
    this.configs.set(config.merchantId, config);
  }
}
