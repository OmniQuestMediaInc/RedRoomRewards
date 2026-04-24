import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
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
