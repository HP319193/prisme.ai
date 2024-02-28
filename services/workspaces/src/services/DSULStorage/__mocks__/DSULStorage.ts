import { ObjectNotFoundError } from '../../../errors';
import { DriverType, IStorage } from '../../../storage/types';
import { DSULStorage } from '../DSULStorage';
import { DSULInterfaces, DSULQuery, DSULType } from '../types';

const getMockedStorage = (initStore?: any): IStorage => {
  const store = initStore || {};
  const driver: IStorage = {
    type: () => DriverType.FILESYSTEM,
    find: () => Promise.resolve([]),
    save: jest.fn((id: string, data: any) => {
      store[id] = data;
      return Promise.resolve(true);
    }),
    copy: jest.fn(),
    export: jest.fn(),
    import: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    get: jest.fn((id: string) => {
      if (id in store) {
        return store[id];
      }
      throw new ObjectNotFoundError();
    }),
  };

  return driver;
};

export class MockStorage<
  t extends keyof DSULInterfaces = DSULType.DSULIndex
> extends DSULStorage<t> {
  constructor(dsulType: t, dsulQuery: DSULQuery = {}, initStore?: any) {
    super(getMockedStorage(initStore), dsulType, dsulQuery);
  }
}
