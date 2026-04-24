import { Injectable } from '@nestjs/common';
import { RedRoomTier, TierProgress } from '../interfaces/redroom-rewards';

@Injectable()
export class TierEngineService {
  private readonly tierThresholds = {
    [RedRoomTier.RED_DESIRE]: 0,
    [RedRoomTier.RED_PASSION]: 5000,
    [RedRoomTier.RED_OBSESSION]: 25000,
    [RedRoomTier.RED_REIGN]: 100000,
  };

  private readonly vibeDescriptions = {
    [RedRoomTier.RED_DESIRE]: 'Heartbeat — alive in the program',
    [RedRoomTier.RED_PASSION]: 'Emotionally invested',
    [RedRoomTier.RED_OBSESSION]: 'Deep craving, committed',
    [RedRoomTier.RED_REIGN]: 'All-in — the most devoted members',
  };

  calculateTier(totalPoints: number): TierProgress {
    let currentTier = RedRoomTier.RED_DESIRE;
    let pointsToNext = this.tierThresholds[RedRoomTier.RED_PASSION];

    for (const [tier, threshold] of Object.entries(this.tierThresholds)) {
      if (totalPoints >= threshold) {
        currentTier = tier as RedRoomTier;
      } else {
        pointsToNext = threshold - totalPoints;
        break;
      }
    }

    return {
      currentTier,
      pointsToNextTier: pointsToNext,
      vibeDescription: this.vibeDescriptions[currentTier],
    };
  }
}
