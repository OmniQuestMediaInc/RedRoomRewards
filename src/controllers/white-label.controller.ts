import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WhiteLabelService } from '../services/white-label.service';
import { WhiteLabelConfig } from '../interfaces/redroom-rewards';

@Controller('white-label')
export class WhiteLabelController {
  constructor(private readonly whiteLabelService: WhiteLabelService) {}

  @Post('config')
  async saveConfig(@Body() config: WhiteLabelConfig) {
    await this.whiteLabelService.saveConfig(config);
    return { success: true };
  }

  @Get('config/:merchantId')
  async getConfig(@Param('merchantId') merchantId: string) {
    return this.whiteLabelService.getConfig(merchantId);
  }
}
