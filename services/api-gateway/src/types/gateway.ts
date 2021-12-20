import { Policies } from "../policies";

export interface Endpoint {
  host?: string;
  hosts?: string[];

  path?: string;
  paths?: string[];
  pathRegexp?: string;

  methods?: string[];
}

export interface Service {
  url: string;
}

export { Policies };

export interface Pipeline {
  name: string;
  endpoints?: string[];
  policies: Policies[];
}
