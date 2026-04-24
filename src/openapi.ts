import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

export function setupSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('RedRoom Rewards™ API')
    .setDescription('Loyalty & Compliance Engine for OmniQuest Media Inc. Parks')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('members', 'Member signup, profile, tiers')
    .addTag('merchants', 'AwardingWallet, white-label')
    .addTag('burn', 'Redemption catalog')
    .addTag('reports', 'Liability & compliance reporting')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
