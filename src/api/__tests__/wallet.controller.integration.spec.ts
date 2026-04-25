/**
 * Wave B / B-003 — WalletController integration spec.
 *
 * Wires the Nest `WalletController` to a mocked `LedgerService` via the Nest
 * testing module so the credit/deduct routes exercise real DI (no manual
 * `new WalletController(...)`). The ledger is mocked here because the real
 * service requires a Mongo connection and a configured replica set; that path
 * is covered by the broader ledger / wallet specs.
 *
 * Imports are routed to the actual implementation locations in this
 * codebase (`src/controllers/wallet.controller.ts` and
 * `src/ledger/ledger.service.ts`). The original payload spec referenced
 * `src/api/wallet.controller` and `src/services/ledger.service`; the
 * Nest controller used by `/wallet/credit` and `/wallet/deduct` lives at
 * the former path, so the imports were rewritten without altering the test
 * intent.
 */

import { Test } from '@nestjs/testing';
import { WalletController } from '../../controllers/wallet.controller';
import { LedgerService } from '../../ledger/ledger.service';

describe('WalletController Integration (B-003)', () => {
  let controller: WalletController;
  let ledger: jest.Mocked<Pick<LedgerService, 'creditPoints' | 'deductPoints'>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: LedgerService,
          useValue: {
            creditPoints: jest.fn(),
            deductPoints: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(WalletController);
    ledger = module.get(LedgerService) as unknown as jest.Mocked<
      Pick<LedgerService, 'creditPoints' | 'deductPoints'>
    >;
  });

  it('credits points and returns the ledger result', async () => {
    ledger.creditPoints.mockResolvedValue(true);

    const result = await controller.credit({
      accountId: 'test',
      amount: 5000,
      reason: 'test',
    });

    expect(result).toEqual({ ok: true });
    expect(ledger.creditPoints).toHaveBeenCalledWith('test', 5000, 'API', 'test', undefined);
  });

  it('deducts points and returns the ledger result', async () => {
    ledger.deductPoints.mockResolvedValue(true);

    const result = await controller.deduct({
      accountId: 'test',
      amount: 1000,
      reason: 'test',
    });

    expect(result).toEqual({ ok: true });
    expect(ledger.deductPoints).toHaveBeenCalledWith('test', 1000, 'API', 'test', undefined);
  });
});
