import { init as initAuthentication } from '../policies/authentication';
export default initAuthentication({
  optional: true,
  csrf: {
    validateToken: true,
  },
});
