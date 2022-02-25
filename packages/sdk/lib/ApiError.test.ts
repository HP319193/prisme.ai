import ApiError from './ApiError';

it('should construct', () => {
  const apiError = new ApiError(
    { error: 'foo', message: 'bar', details: [{}] },
    400
  );
  expect(apiError.code).toBe(400);
  expect(apiError.message).toBe('bar');
  expect(apiError.error).toBe('foo');
  expect(apiError.details).toEqual([{}]);
  expect(`${apiError}`).toBe('foo');
});
