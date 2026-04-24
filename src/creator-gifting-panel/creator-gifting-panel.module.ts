import { Module } from '@nestjs/common';
import { CreatorGiftingPanelController } from '../controllers/creator-gifting-panel.controller';
import { CreatorGiftingPanelService } from '../services/creator-gifting-panel.service';

@Module({
  controllers: [CreatorGiftingPanelController],
  providers: [CreatorGiftingPanelService],
})
export class CreatorGiftingPanelModule {}
