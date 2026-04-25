import { Controller, Get } from '@nestjs/common';
import logger from '../lib/logger';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    logger.info('Health check called');
    return {
      status: 'ok',
      version: '1.0',
      timestamp: new Date().toISOString(),
      components: [
        'ledger',
        'awarding-wallet',
        'member',
        'merchant',
        'burn-catalog',
        'reporting',
        'white-label',
        'creator-gifting',
        'gateguard-av',
      ],
    };
  }
}
