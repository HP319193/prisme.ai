import { syscfg } from '../../config';
import yaml from 'js-yaml';
import Validator from 'validatorjs';
import fs from 'fs';
import { Policies, policiesValidatorSchema } from '../../policies';
import { Config } from '../gateway';
import registerCustomRules from './customRules';

const rootSchema = {
  endpoints: 'required|object',
  services: 'required|object',

  pipelines: 'required|array|min:1',
  'pipelines.*': {
    name: 'required|string',
    endpoints: 'array:string',
    'endpoints.*': 'endpoint_exists|endpoint_used_only_once',
    policies: 'required|array|min:1',
    'policies.*': 'single_policy_in_object|valid_policy_name',
  },
};

const endpointSchema = {
  path: 'required_without_all:paths,pathRegexp|string',
  paths: 'array:string',
  pathRegexp: 'string',
  methods: 'array:string',
  hosts: 'array:string',
};

const serviceSchema = {
  url: 'required|string',
};

export function findConfigErrors(filepath: string) {
  let errors = {};
  function validate(data: any, schema: any, rootKey: string) {
    const validation = new Validator(data, schema);
    validation.check();
    errors = {
      ...errors,
      ...Object.entries(validation.errors?.errors || {}).reduce(
        (errs, [key, msg]) => ({
          [rootKey.length ? rootKey + '.' + key : key]: msg,
        }),
        {}
      ),
    };
  }

  const config = yaml.load(
    fs.readFileSync(filepath) as any as string
  ) as Config;
  registerCustomRules(config);

  validate(config, rootSchema, '');

  // Validate endpoints
  Object.entries(config.endpoints).forEach(([name, endpoint]) => {
    validate(endpoint, endpointSchema, `endpoints.${name}`);
  });

  // Validate services
  Object.entries(config.services).forEach(([name, service]) => {
    validate(service, serviceSchema, `services.${name}`);
  });

  // Now checks each policy individually
  // I did not succeed to handle this directly with validator schema as it always validates every possible policy object even if only one is expected per object
  try {
    config.pipelines.forEach((cur, pipelineIdx) => {
      cur.policies.forEach((cur, policyIdx) => {
        const name = Object.keys(cur)[0] as keyof Policies;
        validate(
          cur[name],
          policiesValidatorSchema[name],
          `pipelines.${pipelineIdx}.policies.${policyIdx}`
        );
      });
    });
  } catch (e) {}

  if (Object.keys(errors).length > 0) {
    return errors;
  }
  return false;
}

export function validateConfiguredConfig() {
  const errors = findConfigErrors(syscfg.GATEWAY_CONFIG);
  if (errors) {
    console.error(errors);
  }
}
