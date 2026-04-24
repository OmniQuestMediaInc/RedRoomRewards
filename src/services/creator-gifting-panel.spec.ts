import { CreatorGiftingPanelService } from './creator-gifting-panel.service';

describe('CreatorGiftingPanelService', () => {
  let service: CreatorGiftingPanelService;

  beforeEach(() => {
    service = new CreatorGiftingPanelService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getPanelState should return promotional balance and recent promotions', async () => {
    const state = await service.getPanelState('creator-1');
    expect(state.promotionalBalance).toBe(12450);
    expect(state.recentPromotions).toHaveLength(2);
    expect(state.recentPromotions[0].title).toBe('Lovense 222 vibe');
    expect(state.recentPromotions[1].pointsAwarded).toBe(1500);
  });
});
