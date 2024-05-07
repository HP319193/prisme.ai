import { logger } from '../../../../../logger';
import { processDataSse } from './parseSseStream';

describe('processDataSse function', () => {
  test('should correctly process simple data lines', () => {
    const input = 'data: simple test\n\n';
    const output = processDataSse(input);
    expect(output).toEqual({ data: ['simple test'] });
  });

  test('should correctly parse JSON data', () => {
    const input = 'data: {"key": "value"}\n\n';
    const output = processDataSse(input);
    expect(output).toEqual({ data: [{ key: 'value' }] });
  });

  test('should correctly handle event type', () => {
    const input = 'event: customEvent\ndata: eventData\n\n';
    const output = processDataSse(input);
    expect(output).toEqual({ event: 'customEvent', data: ['eventData'] });
  });

  test('should handle unterminated data correctly', () => {
    const input = 'data: unterminated data';
    const output = processDataSse(input);
    expect(output).toEqual({ data: ['unterminated data'] });
  });

  test('should warn on invalid SSE chunk line', () => {
    const loggerSpy = jest.spyOn(logger, 'warn');
    const input = 'wrongformat: this is wrong\n\n';
    processDataSse(input);
    expect(loggerSpy).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });

  test('should correctly aggregate multiple data fields', () => {
    const input = 'data: first piece of data\n\ndata: second piece of data\n\n';
    const output = processDataSse(input);
    expect(output).toEqual({
      data: ['first piece of data', 'second piece of data'],
    });
  });

  test('should handle multiple fields correctly (data, event, id, retry)', () => {
    const input =
      'event: update\ndata: {"key": "value"}\nid: 1234\nretry: 3000\n\n';
    const output = processDataSse(input);
    expect(output).toEqual({
      event: 'update',
      data: [{ key: 'value' }],
      id: '1234',
      retry: 3000,
    });
  });

  test('should ignore lines that do not start with recognized fields', () => {
    const input = 'data: valid data\nunrecognized: ignore this line\n\n';
    const output = processDataSse(input);
    expect(output).toEqual({ data: ['valid data'] });
  });

  test('should handle a chunk that ends without double newline', () => {
    const input = 'data: incomplete\n\ndata: final data';
    const output = processDataSse(input);
    expect(output).toEqual({ data: ['incomplete', 'final data'] });
  });

  test('should correctly parse JSON array data', () => {
    const input = 'data: [{"key1": "value1"}, {"key2": "value2"}]\n\n';
    const output = processDataSse(input);
    expect(output).toEqual({
      data: [[{ key1: 'value1' }, { key2: 'value2' }]],
    });
  });
});
