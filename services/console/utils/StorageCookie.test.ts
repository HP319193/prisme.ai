import Storage from './Storage';
import Cookie from 'js-cookie';

jest.mock('./localStorage', () => {
  return {};
});
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

it('should use Local Storage', () => {
  Storage.get('foo');
  expect(Cookie.get).toHaveBeenCalledWith('foo');

  Storage.set('foo', 'bar');
  expect(Cookie.set).toHaveBeenCalledWith('foo', 'bar');
  (Cookie.set as any).mockClear();

  Storage.set('foo', { a: 1 });
  expect(Cookie.set).toHaveBeenCalledWith('foo', '{"a":1}');

  Storage.remove('foo');
  expect(Cookie.remove).toHaveBeenCalledWith('foo');
});
