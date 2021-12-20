import yaml from "js-yaml";
import fs from "fs";

import { Endpoint, Service, Pipeline, errors } from "../types";
import { findConfigErrors } from "./gatewayConfigValidator";

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
    const configErrors = findConfigErrors(filepath);
    if (configErrors) {
      throw new errors.ConfigurationError("Bad configuration", configErrors);
    }
    this.config = (yaml.load(
      fs.readFileSync(filepath, "utf8")
    ) as any) as Config;
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
