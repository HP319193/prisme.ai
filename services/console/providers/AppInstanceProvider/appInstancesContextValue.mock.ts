import { AppInstanceContext } from './AppInstanceProvider';

export const appInstanceContextValue: AppInstanceContext = {
  appInstance: {
    slug: 'app',
    appSlug: 'my-App',
    appName: 'My App',
    config: {},
  },
  fetchAppInstance: jest.fn(),
  loading: false,
  saveAppInstance: jest.fn(),
  saving: false,
  uninstallApp: jest.fn(),
  documentation: null,
};

export default appInstanceContextValue;
