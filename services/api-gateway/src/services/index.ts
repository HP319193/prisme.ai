import identity from './identity';
import { msal } from './msal';
import * as oidcProvider from './oidc/provider';

const oidc = { provider: oidcProvider };
export { identity, msal, oidc };
export default { identity };
