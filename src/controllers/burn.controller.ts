import { Controller, Post, Body } from '@nestjs/common';
import { BurnCatalogService } from '../services/burn-catalog.service';
import { BurnRedemption } from '../interfaces/redroom-rewards';

@Controller('burn')
export class BurnController {
  constructor(private readonly burnService: BurnCatalogService) {}

  @Post('redeem')
  async redeem(@Body() redemption: BurnRedemption) {
    return this.burnService.redeemPoints(redemption);
  }
}
