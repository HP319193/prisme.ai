import { applyObjectUpdateOpLogs } from './applyObjectUpdateOpLogs';

describe('Replace', () => {
  it('Field', () => {
    const init = {
      foo: 'bar',
    };
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'replace',
        path: 'foo',
        value: 'replaced',
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({ foo: 'replaced' });
  });

  it('Entire object', () => {
    const init = {
      foo: 'bar',
    };
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'replace',
        path: '',
        value: { bar: 'foo' },
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({ bar: 'foo' });
  });

  it('Multiple basic in a row', () => {
    const init = {
      foo: 'bar',
    };
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'replace',
        path: 'foo',
        value: 'replaced',
        fullPath: '',
        context: '',
      },
      {
        type: 'replace',
        path: 'house',
        value: 'blue',
        fullPath: '',
        context: '',
      },
      {
        type: 'replace',
        path: 'foo',
        value: 'reset',
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({ foo: 'reset', house: 'blue' });
  });

  it('Nested path', () => {
    const init = {
      foo: 'bar',
      this: {
        is: {
          nested: true,
        },
      },
    };
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'replace',
        path: 'this.is.nested',
        value: false,
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({
      foo: 'bar',
      this: {
        is: {
          nested: false,
        },
      },
    });
  });

  it('Nested path automatically creates fields', () => {
    const init = {};
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'replace',
        path: 'this.is.nested',
        value: false,
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({
      this: {
        is: {
          nested: false,
        },
      },
    });
  });
});

describe('Push', () => {
  it('Basic', () => {
    const init = {};
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'push',
        path: 'foo',
        value: 'un',
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({ foo: ['un'] });
  });

  it('Multiple push in a row', () => {
    const init = {
      array: [],
    };
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'push',
        path: 'array',
        value: 'un',
        fullPath: '',
        context: '',
      },
      {
        type: 'push',
        path: 'array',
        value: 'deux',
        fullPath: '',
        context: '',
      },
      {
        type: 'push',
        path: 'foo',
        value: 'bar',
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({ array: ['un', 'deux'], foo: ['bar'] });
  });

  it('Nested path', () => {
    const init = {
      foo: 'bar',
      this: {
        is: {
          nested: [],
        },
      },
    };
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'push',
        path: 'this.is.nested',
        value: true,
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({
      foo: 'bar',
      this: {
        is: {
          nested: [true],
        },
      },
    });
  });
});

describe('Merge', () => {
  it('Basic', () => {
    const init = {};
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'merge',
        path: 'foo',
        value: { un: 1 },
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({
      foo: {
        un: 1,
      },
    });
  });

  it('Multiple push in a row', () => {
    const init = {
      obj: {},
    };
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'merge',
        path: 'obj',
        value: {
          un: 1,
        },
        fullPath: '',
        context: '',
      },
      {
        type: 'merge',
        path: 'obj',
        value: {
          deux: 2,
        },
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({
      obj: {
        un: 1,
        deux: 2,
      },
    });
  });

  it('Nested path', () => {
    const init = {
      foo: 'bar',
      this: {
        is: {},
      },
    };
    const updated = applyObjectUpdateOpLogs(init, [
      {
        type: 'merge',
        path: 'this.is.nested',
        value: {
          un: 1,
          deux: 2,
        },
        fullPath: '',
        context: '',
      },
    ]);
    expect(updated).toEqual({
      foo: 'bar',
      this: {
        is: {
          nested: {
            un: 1,
            deux: 2,
          },
        },
      },
    });
  });
});
