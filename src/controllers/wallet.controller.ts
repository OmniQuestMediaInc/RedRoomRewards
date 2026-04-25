import { Body, Controller, Post } from '@nestjs/common';
import { LedgerService } from '../ledger/ledger.service';

interface WalletMutationBody {
  accountId: string;
  amount: number;
  reason: string;
  idempotencyKey?: string;
  source?: string;
}

/**
 * Wallet API surface (B-001 credit, B-002 deduct).
 *
 * Thin transport layer over `LedgerService.creditPoints` /
 * `LedgerService.deductPoints`. The ledger service owns transaction safety
 * (B-006), idempotency, balance validation, and the Promotional Bonus bucket
 * routing per the Canonical Corpus.
 */
@Controller('wallet')
export class WalletController {
  constructor(private readonly ledger: LedgerService) {}

  @Post('credit')
  async credit(@Body() body: WalletMutationBody) {
    const ok = await this.ledger.creditPoints(
      body.accountId,
      body.amount,
      body.source ?? 'API',
      body.reason,
      body.idempotencyKey,
    );
    return { ok };
  }

  @Post('deduct')
  async deduct(@Body() body: WalletMutationBody) {
    const ok = await this.ledger.deductPoints(
      body.accountId,
      body.amount,
      body.source ?? 'API',
      body.reason,
      body.idempotencyKey,
    );
    return { ok };
  }
}
