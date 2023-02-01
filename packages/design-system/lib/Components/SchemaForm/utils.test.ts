import { Schema } from './types';
import { getFieldOptions } from './utils';

it('should validate required', () => {
  const { validate } = getFieldOptions({
    validators: {
      required: true,
    } as Schema['validators'],
  });
  expect(validate).toBeDefined();
  expect(validate && validate('abc', ['abc'])).toBe(null);
  expect(validate && validate('', [''])).toBe('required');
});

it('should validate regexp', () => {
  const { validate } = getFieldOptions({
    validators: {
      pattern: {
        value: '[a-z]',
      },
    } as Schema['validators'],
  });
  expect(validate).toBeDefined();
  expect(validate && validate('abc', ['abc'])).toBe(null);
  expect(validate && validate('123', ['123'])).toBe('pattern');
});

it('should validate with message', () => {
  const { validate } = getFieldOptions({
    validators: {
      pattern: {
        value: '[a-z]',
        message: 'wrong pattern',
      },
    } as Schema['validators'],
  });
  expect(validate).toBeDefined();
  expect(validate && validate('abc', ['abc'])).toBe(null);
  expect(validate && validate('123', ['123'])).toBe('wrong pattern');
});

it('should validate tel', () => {
  const { validate } = getFieldOptions({
    validators: {
      tel: true,
    } as Schema['validators'],
  });
  expect(validate).toBeDefined();
  expect(validate && validate('+3360011223355', ['+3360011223355'])).toBe(null);
  expect(validate && validate('foo', ['foo'])).toBe('tel');
});

it('should validate tel with message', () => {
  const { validate } = getFieldOptions({
    validators: {
      tel: {
        message: 'wrong tel',
      },
    } as Schema['validators'],
  });
  expect(validate).toBeDefined();
  expect(validate && validate('+3360011223355', ['+3360011223355'])).toBe(null);
  expect(validate && validate('foo', ['foo'])).toBe('wrong tel');
});

it('should validate min', () => {
  const { validate } = getFieldOptions({
    validators: {
      min: {
        value: 10,
      },
    } as Schema['validators'],
  });
  expect(validate).toBeDefined();
  expect(validate && validate('11', ['11'])).toBe(null);
  expect(validate && validate('9', ['9'])).toBe('min');
});

it('should validate max', () => {
  const { validate } = getFieldOptions({
    validators: {
      max: {
        value: 10,
      },
    } as Schema['validators'],
  });
  expect(validate).toBeDefined();
  expect(validate && validate('9', ['9'])).toBe(null);
  expect(validate && validate('11', ['11'])).toBe('max');
});

it('should validate email', () => {
  const { validate } = getFieldOptions({
    validators: {
      email: true,
    } as Schema['validators'],
  });
  expect(validate).toBeDefined();
  expect(validate && validate('maurice@moss.com', ['maurice@moss.com'])).toBe(
    null
  );
  expect(validate && validate('maurice', ['maurice'])).toBe('email');
});

it('should validate date', () => {
  const { validate } = getFieldOptions({
    validators: {
      date: true,
    } as Schema['validators'],
  });
  expect(validate).toBeDefined();
  expect(validate && validate('2022-01-01', ['2022-01-01'])).toBe(null);
  expect(validate && validate('foo', ['2022'])).toBe('date');
});

it('should validate deprecated pattern', () => {
  const { validate } = getFieldOptions({
    pattern: '[a-z]',
  });
  expect(validate).toBeDefined();
  expect(validate && validate('abc', ['abc'])).toBe(null);
  expect(validate && validate('123', ['123'])).toBe('pattern');
});
