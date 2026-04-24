import { Controller, Post, Body, Req } from '@nestjs/common';
import { CreatorGiftingService } from '../services/creator-gifting.service';
import { CreatorGiftingPromotion } from '../interfaces/redroom-rewards';

@Controller('creator-gifting')
export class CreatorGiftingController {
  constructor(private readonly creatorGiftingService: CreatorGiftingService) {}

  @Post('create')
  async create(@Body() promotion: CreatorGiftingPromotion, @Req() req: any) {
    const creatorId = req.user.creatorId;
    return this.creatorGiftingService.createPromotion(creatorId, promotion);
  }
}
