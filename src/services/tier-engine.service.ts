import { Injectable } from '@nestjs/common';
import { RedRoomTier } from '../interfaces/redroom-rewards';

export interface TierCalculationResult {
  currentTier: RedRoomTier;
  pointsToNextTier: number;
  nextTier: RedRoomTier | null;
}

/**
 * TierEngineService
 *
 * Computes a member's Red Room tier from their lifetime/promotional point
 * balance using the brand ladder:
 *   RED_DESIRE → RED_PASSION → RED_OBSESSION → RED_REIGN
 *
 * Thresholds are prototype defaults and will be replaced by tenant-scoped
 * config in a later payload.
 */
@Injectable()
export class TierEngineService {
  private static readonly THRESHOLDS: Array<{ tier: RedRoomTier; min: number }> = [
    { tier: RedRoomTier.RED_DESIRE, min: 0 },
    { tier: RedRoomTier.RED_PASSION, min: 5_000 },
    { tier: RedRoomTier.RED_OBSESSION, min: 25_000 },
    { tier: RedRoomTier.RED_REIGN, min: 100_000 },
  ];

  calculateTier(totalPoints: number): TierCalculationResult {
    const ladder = TierEngineService.THRESHOLDS;

    let currentIndex = 0;
    for (let i = 0; i < ladder.length; i++) {
      if (totalPoints >= ladder[i].min) {
        currentIndex = i;
      }
    }

    const currentTier = ladder[currentIndex].tier;
    const nextStep = ladder[currentIndex + 1];

    return {
      currentTier,
      pointsToNextTier: nextStep ? nextStep.min - totalPoints : 0,
      nextTier: nextStep ? nextStep.tier : null,
    };
  }
}
