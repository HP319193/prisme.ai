import { QueryStringProviderContext } from './QueryStringProvider';

export const queryStringContextValue: QueryStringProviderContext = {
  queryString: new URLSearchParams(),
  setQueryString: jest.fn(),
};

export default queryStringContextValue;
