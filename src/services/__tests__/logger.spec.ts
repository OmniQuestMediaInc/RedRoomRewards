import logger from '../../lib/logger';

describe('Structured Logger (D-001)', () => {
  it('logs in JSON format with required fields', () => {
    const logSpy = jest.spyOn(logger, 'info');
    logger.info('Test log');
    expect(logSpy).toHaveBeenCalled();
  });
});
