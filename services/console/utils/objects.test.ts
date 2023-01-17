import { mergeAndCleanObjects, removedUndefinedProperties } from './objects';

describe('removedUndefinedProperties', () => {
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
});

describe('mergeAndCleanObjects', () => {
  it('should merge two objects', () => {
    expect(mergeAndCleanObjects({ foo: '1' }, { bar: 2 })).toEqual({
      foo: '1',
      bar: 2,
    });
  });

  it('should clean undefined values', () => {
    expect(
      mergeAndCleanObjects(
        {
          foo: '1',
          bar: 2,
        },
        { bar: undefined }
      )
    ).toEqual({
      foo: '1',
    });
  });

  it('should clean nested undefined values', () => {
    expect(
      mergeAndCleanObjects(
        {
          foo: {
            sub: '1',
          },
          bar: {
            sub: 2,
            other: 3,
          },
        },
        { bar: { sub: undefined } }
      )
    ).toEqual({
      foo: { sub: '1' },
      bar: { other: 3 },
    });
  });

  it('should not break arrays', () => {
    expect(
      mergeAndCleanObjects(
        {
          foo: [],
          bar: [{}, {}],
        },
        { bar: [] }
      )
    ).toEqual({
      foo: [],
      bar: [],
    });
  });

  it('should clean in nested arrays', () => {
    expect(
      mergeAndCleanObjects(
        {
          foo: [
            {
              bar: {
                sub: true,
              },
            },
            {
              bar: {
                sub: false,
              },
            },
          ],
        },
        {
          foo: [
            {
              bar: {
                sub: false,
              },
            },
          ],
        }
      )
    ).toEqual({
      foo: [
        {
          bar: {
            sub: false,
          },
        },
      ],
    });
  });
});
