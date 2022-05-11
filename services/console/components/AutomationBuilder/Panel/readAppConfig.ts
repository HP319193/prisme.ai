import { JSONPath } from 'jsonpath-plus';

export const readAppConfig = (appConfig: any, path: string) => {
  return JSONPath({ path, json: appConfig });
};
