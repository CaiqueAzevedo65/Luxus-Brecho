import { logger, LogLevel } from '../../utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    logger.clearLogs();
    logger.setLevel(LogLevel.DEBUG);
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message', 'TEST');
    const logs = logger.getLogs();
    
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe(LogLevel.DEBUG);
    expect(logs[0].message).toBe('Test debug message');
    expect(logs[0].context).toBe('TEST');
  });

  it('should log info messages', () => {
    logger.info('Test info message', 'TEST');
    const logs = logger.getLogs();
    
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe(LogLevel.INFO);
    expect(logs[0].message).toBe('Test info message');
  });

  it('should log error messages with error object', () => {
    const error = new Error('Test error');
    logger.error('Test error message', error, 'TEST');
    const logs = logger.getLogs();
    
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe(LogLevel.ERROR);
    expect(logs[0].message).toBe('Test error message');
    expect(logs[0].error).toBe(error);
  });

  it('should filter logs by level', () => {
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');
    
    const errorLogs = logger.getLogs(LogLevel.ERROR);
    expect(errorLogs).toHaveLength(1);
    expect(errorLogs[0].level).toBe(LogLevel.ERROR);
    
    const warnLogs = logger.getLogs(LogLevel.WARN);
    expect(warnLogs).toHaveLength(2); // WARN and ERROR
  });

  it('should clear logs', () => {
    logger.info('Test message');
    expect(logger.getLogs()).toHaveLength(1);
    
    logger.clearLogs();
    expect(logger.getLogs()).toHaveLength(0);
  });

  it('should respect log level filtering', () => {
    logger.setLevel(LogLevel.WARN);
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe(LogLevel.WARN);
  });
});
