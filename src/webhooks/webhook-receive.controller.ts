import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { WebhookReceiveService } from './webhook-receive.service';

/**
 * WebhookReceiveController (C-007)
 *
 * Exposes POST /webhooks/receive for inbound webhook events.
 * Delegates signature verification, idempotency, and routing
 * to WebhookReceiveService.
 */
@Controller('webhooks')
export class WebhookReceiveController {
  constructor(private readonly webhookService: WebhookReceiveService) {}

  @Post('receive')
  async receive(
    @Body() payload: Record<string, unknown>,
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-webhook-timestamp') timestamp: string,
    @Req() req: unknown,
  ): Promise<{ status: string; eventId: string }> {
    return this.webhookService.handleIncoming(payload, signature, timestamp, req);
  }
}
