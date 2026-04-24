/**
 * Lightweight Metrics Logger
 *
 * Simple console-based metrics logging for M1 production hardening.
 * Follows existing logging patterns in the codebase.
 * In production, this can be replaced with a proper metrics backend.
 */

import { MetricData, AlertData, MetricEventType, AlertSeverity } from './types';

/**
 * Returns false when metrics/alert logging should be suppressed.
 * Suppressed in NODE_ENV=test (prevents CI noise) and when
 * DISABLE_METRICS_LOGS=1 (allows opt-out in any environment).
 * Production behavior is fully preserved in all other envs.
 */
function shouldEmitMetricsLogs(): boolean {
  return process.env.NODE_ENV !== 'test' && process.env.DISABLE_METRICS_LOGS !== '1';
}

/**
 * Simple metrics logger using console output
 * Designed for easy integration with external monitoring systems
 */
export class MetricsLogger {
  /**
   * Log a metric event
   */
  static logMetric(data: MetricData): void {
    if (!shouldEmitMetricsLogs()) return;

    const logEntry = {
      level: 'METRIC',
      type: data.type,
      value: data.value,
      timestamp: data.timestamp.toISOString(),
      metadata: data.metadata,
    };

    console.log(JSON.stringify(logEntry));
  }

  /**
   * Log an alert
   */
  static logAlert(data: AlertData): void {
    if (!shouldEmitMetricsLogs()) return;

    const logEntry = {
      level: 'ALERT',
      severity: data.severity,
      message: data.message,
      metricType: data.metricType,
      timestamp: data.timestamp.toISOString(),
      metadata: data.metadata,
    };

    // Use appropriate console method based on severity
    switch (data.severity) {
      case AlertSeverity.CRITICAL:
      case AlertSeverity.ERROR:
        console.error(JSON.stringify(logEntry));
        break;
      case AlertSeverity.WARNING:
        console.warn(JSON.stringify(logEntry));
        break;
      default:
        console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Helper to log a simple counter metric
   */
  static incrementCounter(type: MetricEventType, metadata?: Record<string, unknown>): void {
    MetricsLogger.logMetric({
      type,
      value: 1,
      timestamp: new Date(),
      metadata,
    });
  }

  /**
   * Helper to log a duration metric (in milliseconds)
   */
  static recordDuration(
    type: MetricEventType,
    durationMs: number,
    metadata?: Record<string, unknown>,
  ): void {
    MetricsLogger.logMetric({
      type,
      value: durationMs,
      timestamp: new Date(),
      metadata,
    });
  }
}
