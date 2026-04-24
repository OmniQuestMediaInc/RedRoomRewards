import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupSwagger } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: true }); // tighten in prod
  app.enableShutdownHooks();

  // OpenAPI / Swagger
  setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 RedRoom Rewards™ engine v1.0 running on http://localhost:${port}`);
  console.log(`📄 OpenAPI docs: http://localhost:${port}/api/docs`);
  console.log(`✅ Mandatory 18+ GateGuard AV • Promotional Bonus • Immutable ledger`);
}
bootstrap();
