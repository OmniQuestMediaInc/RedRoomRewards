import { registerAs } from '@nestjs/config';

export default registerAs('production', () => ({
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  rateLimit: {
    ttl: 60,
    limit: 100,
  },
  swaggerEnabled: process.env.NODE_ENV !== 'production',
}));
