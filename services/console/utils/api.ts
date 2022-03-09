import getConfig from 'next/config';
import { Api } from '@prisme.ai/sdk';
import Storage from './Storage';

const { publicRuntimeConfig } = getConfig();

const api = new Api(publicRuntimeConfig.API_HOST);
api.token = Storage.get('auth-token');

export * from '@prisme.ai/sdk';
export default api;
