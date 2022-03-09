import Storage from './Storage';
import localStorage from './localStorage';

it('should use Local Storage', () => {
  localStorage.clear();
  localStorage.setItem('foo', 'bar');
  expect(Storage.get('foo')).toBe('bar');

  Storage.set('foo', 'BAR');
  expect(localStorage.getItem('foo')).toBe('BAR');
  expect(Storage.get('foo')).toBe('BAR');

  Storage.remove('foo');
  expect(localStorage.getItem('foo')).toBeNull();
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
