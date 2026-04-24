/**
 * Centralized NODE_ENV override for tests.
 *
 * Many specs need to bypass guards that suppress behaviour when
 * NODE_ENV === 'test' (e.g. metrics logger). Hard-coding the override
 * in each spec produces recurring merge conflicts. This helper gives
 * every spec a single canonical way to swap NODE_ENV for the duration
 * of a test and restore the prior value afterwards.
 *
 * Usage:
 *   let restoreEnv: () => void;
 *   beforeEach(() => { restoreEnv = setTestEnv('production'); });
 *   afterEach(() => { restoreEnv(); });
 */
export function setTestEnv(env: 'development' | 'production' | 'test' = 'test'): () => void {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = env;
  return () => {
    process.env.NODE_ENV = originalEnv;
  };
}
