import { CreatorGiftingPanelService } from './creator-gifting-panel.service';

describe('CreatorGiftingPanelService', () => {
  let service: CreatorGiftingPanelService;

  beforeEach(() => {
    service = new CreatorGiftingPanelService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getPanelState should return zero balance + empty promotions until ledger wiring lands', async () => {
    const state = await service.getPanelState('creator-1');
    expect(state.promotionalBalance).toBe(0);
    expect(state.recentPromotions).toHaveLength(0);
  });
});
