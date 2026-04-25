import { Module } from '@nestjs/common';
import { WalletController } from '../controllers/wallet.controller';
import { LedgerService } from '../ledger/ledger.service';

/**
 * Wallet HTTP module (B-001 credit, B-002 deduct).
 *
 * Exposes the credit/deduct API endpoints backed by `LedgerService`. The
 * `LedgerService` is registered via factory (matching the pattern in
 * MemberModule/BurnModule/etc., per F-017) because it is not `@Injectable()`
 * and takes a `Partial<LedgerConfig>` constructor argument.
 */
@Module({
  controllers: [WalletController],
  providers: [{ provide: LedgerService, useFactory: () => new LedgerService() }],
})
export class WalletModule {}
