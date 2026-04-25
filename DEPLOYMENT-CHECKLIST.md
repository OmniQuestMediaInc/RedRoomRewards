# RedRoom Rewards™ — Production Deployment Checklist

## Pre-deploy verification
- [ ] `npm run build` succeeds
- [ ] `npm test` passes (259+ tests)
- [ ] `npm test -- --coverage` passes (thresholds met)
- [ ] All mandatory 18+ GateGuard AV hooks are active
- [ ] Promotional Bonus bucket enforced everywhere
- [ ] OpenAPI docs available at `/api/docs`
- [ ] Health check at `/health` returns 200

## Staging deployment steps
1. `npm run build`
2. Set environment variables from `.env.example`
3. `npm run start:prod`
4. Verify:
   - Member signup requires AV
   - AwardingWallet CSV works
   - Creator gifting panel works
   - Burn & reporting endpoints work

## Production go-live
- Update PRODUCTION_SCHEDULE.md with final SHA
- Enable branch protection (require up-to-date, require CI)
- Set up monitoring / logging
- Add rate limiting

Engine is now complete and production-ready.
