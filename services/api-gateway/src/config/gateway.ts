import yaml from 'js-yaml';
import fs from 'fs';

import { Endpoint, Service, Pipeline } from '../types';

export interface Config {
  endpoints: {
    [k: string]: Endpoint;
  };

  services: {
    [k: string]: Service;
  };

  pipelines: Pipeline[];
}

export default class GatewayConfig {
  public config: Config;

  constructor(filepath: string) {
    const raw = fs.readFileSync(filepath, 'utf8');
    this.config = yaml.load(
      this.injectEnvironmentVariables(raw)
    ) as any as Config;
  }

  private injectEnvironmentVariables(raw: string) {
    const regexp = new RegExp(/\${([^}]+)}/g);
    const matches = raw.match(regexp);
    return (matches! || []).reduce((config, pattern) => {
      const [variable, defaultValue] = pattern.slice(2, -1).split(':-');
      if (process.env[variable] || defaultValue) {
        //@ts-ignore
        return config.replaceAll(
          pattern,
          (process.env[variable] || defaultValue)!!
        );
      }
      return config;
    }, raw);
  }

  public service(name: string): Service {
    return this.config.services[name];
  }

  public endpoint(name: string): Endpoint {
    return this.config.endpoints[name];
  }

  get endpointToPipeline() {
    const map: {
      [k: string]: Pipeline;
    } = {};
    this.config.pipelines.forEach((pipeline) => {
      (pipeline.endpoints || []).forEach((endpoint) => {
        map[endpoint] = pipeline;
      });
    });
    return map;
  }
}
