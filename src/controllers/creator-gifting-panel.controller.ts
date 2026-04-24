import { Controller, Get, Req } from '@nestjs/common';
import { CreatorGiftingPanelService } from '../services/creator-gifting-panel.service';

@Controller('creator/gifting-panel')
export class CreatorGiftingPanelController {
  constructor(private readonly panelService: CreatorGiftingPanelService) {}

  @Get('state')
  async getState(@Req() req: any) {
    const creatorId = req.user?.creatorId;
    return this.panelService.getPanelState(creatorId);
  }
}
