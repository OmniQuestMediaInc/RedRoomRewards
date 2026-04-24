import { Module } from '@nestjs/common';
import { WhiteLabelController } from '../controllers/white-label.controller';
import { WhiteLabelService } from '../services/white-label.service';

@Module({
  controllers: [WhiteLabelController],
  providers: [WhiteLabelService],
})
export class WhiteLabelModule {}
