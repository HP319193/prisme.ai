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

interface PolicyMatch {
  path?: string;
  methods?: string[];
}

interface Policies {
  match: PolicyMatch;
  [k: string]: object;
}

export interface Pipeline {
  name: string;
  endpoints?: string[];
  policies: Policies[];
}
