import { DiffType, getObjectsDifferences } from './getObjectsDifferences';

it('Diffs of 2 empty objects should be ValueUnchanged', () => {
  const diffs = getObjectsDifferences({}, {});
  expect(diffs).toMatchObject({
    __type: DiffType.ValueUnchanged,
    data: {},
  });
});

it('Diffs of 2 same objects should be ValueUnchanged', () => {
  const diffs = getObjectsDifferences({ un: 1 }, { un: 1 });
  expect(diffs).toMatchObject({
    __type: DiffType.ValueUnchanged,
    data: {
      un: {
        __type: DiffType.ValueUnchanged,
        data: 1,
      },
    },
  });
});

it('Diffs of 2 same nested objects should be ValueUnchanged', () => {
  const diffs = getObjectsDifferences({ un: { deux: 2 } }, { un: { deux: 2 } });
  expect(diffs).toMatchObject({
    __type: DiffType.ValueUnchanged,
    data: {
      un: {
        __type: DiffType.ValueUnchanged,
        data: {
          deux: {
            __type: DiffType.ValueUnchanged,
            data: 2,
          },
        },
      },
    },
  });
});

it('Diffs of 2 differents nested objects should be ValueChanged', () => {
  const diffs = getObjectsDifferences(
    { un: { foo: 'foo', deux: 2 } },
    { un: { foo: 'foo', deux: 3 } }
  );

  expect(diffs).toMatchObject({
    __type: DiffType.ValueUpdated,
    data: {
      un: {
        __type: DiffType.ValueUpdated,
        data: {
          foo: {
            __type: DiffType.ValueUnchanged,
            data: 'foo',
          },
          deux: {
            __type: DiffType.ValueUpdated,
            data: 3,
          },
        },
      },
    },
  });
});

it('One object has an additional subfield', () => {
  const diffs = getObjectsDifferences(
    { un: { foo: 'foo' } },
    {
      un: {
        foo: 'foo',
        deux: {
          value: 2,
          moreNested: {
            bar: 'bar',
          },
        },
      },
    }
  );

  expect(diffs).toMatchObject({
    __type: DiffType.ValueUpdated,
    data: {
      un: {
        __type: DiffType.ValueUpdated,
        data: {
          foo: {
            __type: DiffType.ValueUnchanged,
            data: 'foo',
          },
          deux: {
            __type: DiffType.ValueCreated,
            data: {
              value: {
                __type: DiffType.ValueCreated,
                data: 2,
              },
              moreNested: {
                __type: DiffType.ValueCreated,
                data: {
                  bar: {
                    __type: DiffType.ValueCreated,
                    data: 'bar',
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});

it('One object has 1 subfield less', () => {
  const diffs = getObjectsDifferences(
    { un: { foo: 'foo', deux: 2 } },
    { un: { foo: 'foo' } }
  );

  expect(diffs).toMatchObject({
    __type: DiffType.ValueUpdated,
    data: {
      un: {
        __type: DiffType.ValueUpdated,
        data: {
          foo: {
            __type: DiffType.ValueUnchanged,
            data: 'foo',
          },
          deux: {
            __type: DiffType.ValueDeleted,
            data: 2,
          },
        },
      },
    },
  });
});

it('One object has 1 nested subfield less', () => {
  const diffs = getObjectsDifferences(
    { un: { foo: 'foo', deux: { value: 2 } } },
    { un: { foo: 'foo' } }
  );

  expect(diffs).toMatchObject({
    __type: DiffType.ValueUpdated,
    data: {
      un: {
        __type: DiffType.ValueUpdated,
        data: {
          foo: {
            __type: DiffType.ValueUnchanged,
            data: 'foo',
          },
          deux: {
            __type: DiffType.ValueDeleted,
            data: {
              value: {
                __type: DiffType.ValueDeleted,
                data: 2,
              },
            },
          },
        },
      },
    },
  });
});

it('One object has 1 nested subfield less & another more', () => {
  const diffs = getObjectsDifferences(
    { un: { foo: 'foo', deux: { value: 2 } }, bla: 'bla', someOtherObject: {} },
    {
      un: {
        foo: 'foo',
        trois: {
          value: 2,
          moreNested: {
            bar: 'bar',
          },
        },
      },
      bla: 'bla',
      someOtherObject: {},
    }
  );

  expect(diffs).toMatchObject({
    __type: DiffType.ValueUpdated,
    data: {
      un: {
        __type: DiffType.ValueUpdated,
        data: {
          foo: {
            __type: DiffType.ValueUnchanged,
            data: 'foo',
          },
          deux: {
            __type: DiffType.ValueDeleted,
            data: {
              value: {
                __type: DiffType.ValueDeleted,
                data: 2,
              },
            },
          },
          trois: {
            __type: DiffType.ValueCreated,
            data: {
              value: {
                __type: DiffType.ValueCreated,
                data: 2,
              },
              moreNested: {
                __type: DiffType.ValueCreated,
                data: {
                  bar: {
                    __type: DiffType.ValueCreated,
                    data: 'bar',
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});
