import Storage from './Storage';
import localStorage from './localStorage';
const ls = localStorage!;

it('should use Local Storage', () => {
  ls.clear();
  ls.setItem('foo', 'bar');
  expect(Storage.get('foo')).toBe('bar');

  Storage.set('foo', 'BAR');
  expect(ls.getItem('foo')).toBe('BAR');
  expect(Storage.get('foo')).toBe('BAR');

  Storage.remove('foo');
  expect(ls.getItem('foo')).toBeNull();
  expect(Storage.get('foo')).toBeNull();
});

it('should not access auth token', () => {
  window.localStorage.clear();
  Storage.set('access-token', 'confidential');
  expect(window.localStorage.getItem('access-token')).toBeNull();
  expect(window.localStorage['access-token']).not.toBeDefined();
  expect(Storage.get('access-token')).toBe('confidential');

  window.localStorage.removeItem('access-token');
  expect(Storage.get('access-token')).toBe('confidential');

  window.localStorage.setItem('access-token', 'HACKED');
  expect(Storage.get('access-token')).toBe('confidential');
});
