## Summary

<!-- What does this PR do and why? Reference the directive ID if applicable. -->

## Directive

<!-- If this PR implements a Program Control directive, state the ID. -->
<!-- Example: RRR-P1-001 -->

N/A

## Changes

<!-- List specific changes made. Keep it factual — no invented behavior. -->

-

## Commit Prefix

<!-- Which RRR prefix does this PR use? (FIZ | DB | API | SVC | INFRA | UI | GOV | TEST | CHORE) -->
<!-- FIZ-scoped PRs require REASON, IMPACT, and CORRELATION_ID below. -->

**Prefix:** CHORE

## FIZ Scope (required if prefix = FIZ)

<!-- Delete this section if not FIZ-scoped. -->

- **REASON:**
- **IMPACT:**
- **CORRELATION_ID:**

## Testing

- [ ] Unit tests added / updated
- [ ] Integration tests added / updated
- [ ] Manual testing performed
- [ ] All existing tests still pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Lint passes (`npm run lint`)

## Security Considerations

- [ ] Server-side validation for all inputs
- [ ] Idempotency keys for state-changing operations
- [ ] Authentication required on affected endpoints
- [ ] No secrets or PII in code or logs
- [ ] No code from `/archive/` used

## Merge Conflict Checklist

<!-- If this PR has merge conflicts with main, resolve them before requesting review. -->

- [ ] Branch is up to date with `main` (`git fetch origin main && git merge origin/main`)
- [ ] `package-lock.json` conflicts resolved by running `npm install` after merge
- [ ] No unrelated changes introduced during conflict resolution

## Breaking Changes

<!-- None, or describe breaking changes and migration path. -->

None

## References

<!-- Link to issues, specs, architecture docs, or API contracts. -->

-
