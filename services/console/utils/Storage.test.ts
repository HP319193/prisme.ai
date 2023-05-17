import Storage from './Storage';
import localStorage from './localStorage';
const ls = localStorage!

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
  Storage.set('auth-token', 'confidential');
  expect(window.localStorage.getItem('auth-token')).toBeNull();
  expect(window.localStorage['auth-token']).not.toBeDefined();
  expect(Storage.get('auth-token')).toBe('confidential');

  window.localStorage.removeItem('auth-token');
  expect(Storage.get('auth-token')).toBe('confidential');

  window.localStorage.setItem('auth-token', 'HACKED');
  expect(Storage.get('auth-token')).toBe('confidential');
});
