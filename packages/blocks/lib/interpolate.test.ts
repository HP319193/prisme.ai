import { interpolate, interpolateString } from './interpolate';

it('should interpolate string', () => {
  expect(interpolateString('foo ${var}', { var: 'bar' })).toBe('foo bar');
});

it('should interpolate string 2', () => {
  expect(interpolateString('foo ${var} yeah ${var2}', { var: 'bar' })).toBe(
    'foo bar yeah '
  );
});

it('should interpolate string 3', () => {
  expect(interpolateString('foo ${invalid var} yeah', { var: 'bar' })).toBe(
    'foo  yeah'
  );
});

it('should interpolate string 4', () => {
  expect(interpolateString('foo ${var}}}', { var: 'bar' })).toBe('foo bar}}');
});

it('should interpolate nested values', () => {
  expect(
    interpolateString('foo ${var.foo.bar}', {
      var: {
        foo: {
          bar: 'bar',
        },
      },
    })
  ).toBe('foo bar');
});

it('should interpolate object', () => {
  expect(
    interpolate(
      {
        a: 'foo ${var}',
        b: 'foo ${var} yeah',
      },
      {
        var: 'bar',
      }
    )
  ).toEqual({
    a: 'foo bar',
    b: 'foo bar yeah',
  });
});
