import { removedUndefinedProperties } from './utils';

it('should remove undefined keys', () => {
  const myObject = {
    first: 'one',
    second: 'second',
    third: '',
    fourth: undefined,
    fifth: 5,
  };

  const newObject = removedUndefinedProperties(myObject);

  expect(newObject).toStrictEqual({
    first: 'one',
    second: 'second',
    third: '',
    fifth: 5,
  });
});

it('should remove empty strings if specified', () => {
  const myObject = {
    first: 'one',
    second: 'second',
    third: '',
    fourth: undefined,
    fifth: 5,
  };

  const newObject = removedUndefinedProperties(myObject, true);

  expect(newObject).toStrictEqual({
    first: 'one',
    second: 'second',
    fifth: 5,
  });
});
