/**
 * Metrics Logger Tests
 */

import { MetricsLogger, MetricEventType, AlertSeverity, logIngestEvent } from './index';
import { setTestEnv } from '../test/helpers/setTestEnv';

describe('MetricsLogger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let restoreEnv: () => void;

  beforeEach(() => {
    // The logger is a no-op when NODE_ENV === 'test' (see src/metrics/logger.ts).
    // Override here so this spec can verify the console-writing behavior.
    restoreEnv = setTestEnv('development');

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    restoreEnv();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('suppression behaviour', () => {
    it('should be silent when NODE_ENV=test', () => {
      process.env.NODE_ENV = 'test';

      MetricsLogger.logMetric({
        type: MetricEventType.INGEST_EVENT_PROCESSED,
        value: 1,
        timestamp: new Date(),
      });
      MetricsLogger.logAlert({
        severity: AlertSeverity.ERROR,
        message: 'should be suppressed',
        timestamp: new Date(),
      });

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should be silent when DISABLE_METRICS_LOGS=1', () => {
      process.env.DISABLE_METRICS_LOGS = '1';

      try {
        MetricsLogger.logMetric({
          type: MetricEventType.INGEST_EVENT_PROCESSED,
          value: 1,
          timestamp: new Date(),
        });
        MetricsLogger.logAlert({
          severity: AlertSeverity.WARNING,
          message: 'should be suppressed',
          timestamp: new Date(),
        });

        expect(consoleLogSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      } finally {
        delete process.env.DISABLE_METRICS_LOGS;
      }
    });
  });

  describe('logMetric', () => {
    it('should log a metric with all fields', () => {
      const timestamp = new Date();
      MetricsLogger.logMetric({
        type: MetricEventType.INGEST_EVENT_PROCESSED,
        value: 1,
        timestamp,
        metadata: { eventId: 'test-123' },
      });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('METRIC');
      expect(loggedData.type).toBe(MetricEventType.INGEST_EVENT_PROCESSED);
      expect(loggedData.value).toBe(1);
      expect(loggedData.metadata).toEqual({ eventId: 'test-123' });
    });

    it('should log a metric without value', () => {
      const timestamp = new Date();
      MetricsLogger.logMetric({
        type: MetricEventType.DLQ_EVENT_MOVED,
        timestamp,
      });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('METRIC');
      expect(loggedData.type).toBe(MetricEventType.DLQ_EVENT_MOVED);
      expect(loggedData.value).toBeUndefined();
    });
  });

  describe('logAlert', () => {
    it('should log info alert to console.log', () => {
      const timestamp = new Date();
      MetricsLogger.logAlert({
        severity: AlertSeverity.INFO,
        message: 'Test info alert',
        timestamp,
      });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('ALERT');
      expect(loggedData.severity).toBe(AlertSeverity.INFO);
      expect(loggedData.message).toBe('Test info alert');
    });

    it('should log warning alert to console.warn', () => {
      const timestamp = new Date();
      MetricsLogger.logAlert({
        severity: AlertSeverity.WARNING,
        message: 'Test warning alert',
        timestamp,
      });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('ALERT');
      expect(loggedData.severity).toBe(AlertSeverity.WARNING);
    });

    it('should log error alert to console.error', () => {
      const timestamp = new Date();
      MetricsLogger.logAlert({
        severity: AlertSeverity.ERROR,
        message: 'Test error alert',
        timestamp,
      });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('ALERT');
      expect(loggedData.severity).toBe(AlertSeverity.ERROR);
    });

    it('should log critical alert to console.error', () => {
      const timestamp = new Date();
      MetricsLogger.logAlert({
        severity: AlertSeverity.CRITICAL,
        message: 'Test critical alert',
        metricType: MetricEventType.DLQ_EVENT_MOVED,
        timestamp,
        metadata: { count: 100 },
      });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('ALERT');
      expect(loggedData.severity).toBe(AlertSeverity.CRITICAL);
      expect(loggedData.metricType).toBe(MetricEventType.DLQ_EVENT_MOVED);
      expect(loggedData.metadata).toEqual({ count: 100 });
    });
  });

  describe('incrementCounter', () => {
    it('should log a counter metric with value 1', () => {
      MetricsLogger.incrementCounter(MetricEventType.RESERVATION_CREATED, {
        reservationId: 'res-123',
      });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.type).toBe(MetricEventType.RESERVATION_CREATED);
      expect(loggedData.value).toBe(1);
      expect(loggedData.metadata).toEqual({ reservationId: 'res-123' });
    });
  });

  describe('recordDuration', () => {
    it('should log a duration metric', () => {
      MetricsLogger.recordDuration(MetricEventType.DLQ_REPLAY_STARTED, 1500, { eventCount: 10 });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.type).toBe(MetricEventType.DLQ_REPLAY_STARTED);
      expect(loggedData.value).toBe(1500);
      expect(loggedData.metadata).toEqual({ eventCount: 10 });
    });
  });

  describe('logIngestEvent', () => {
    it('should log a structured ingest event when NODE_ENV=production', () => {
      logIngestEvent({
        correlationId: 'corr-001',
        merchantId: 'merch-42',
        eventType: 'purchase',
        eventId: 'evt-99',
        idempotencyKey: 'idem-key-1',
        outcome: 'accepted',
        httpStatus: 200,
      });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(loggedData.level).toBe('INFO');
      expect(loggedData.category).toBe('ingest');
      expect(loggedData.correlationId).toBe('corr-001');
      expect(loggedData.merchantId).toBe('merch-42');
      expect(loggedData.eventId).toBe('evt-99');
      expect(loggedData.outcome).toBe('accepted');
      expect(loggedData.httpStatus).toBe(200);
    });

    it('should be silent when NODE_ENV=test', () => {
      process.env.NODE_ENV = 'test';

      logIngestEvent({
        correlationId: 'corr-002',
        eventId: 'evt-100',
        idempotencyKey: 'idem-key-2',
        outcome: 'rejected',
        httpStatus: 400,
        errorCode: 'VALIDATION_ERROR',
      });

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
