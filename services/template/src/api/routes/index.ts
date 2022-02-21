import { Application } from 'express';

import sys from './sys';

export const init = (app: Application): void => {
  const root = '/v2';
  app.use(`/sys`, sys);
  //app.use(`${root}/template`, templates);
};
export default init;
