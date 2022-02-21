import Validator from 'validatorjs';
import { policiesValidatorSchema } from '../../policies';
import { Config } from '../gateway';

export default function (config: Config) {
  Validator.register(
    'object',
    function (value, requirement, attribute) {
      return value.constructor === Object;
    },
    'must be an object'
  );

  Validator.register(
    'single_policy_in_object',
    function (value, requirement, attribute) {
      // requirement parameter defaults to null
      if (Object.keys(value).length !== 1) {
        return false;
      }
      return true;
    },
    'A policy object must have one and only one policy configured'
  );

  const allPolicyNames = Object.keys(policiesValidatorSchema).join(',');
  Validator.register(
    'valid_policy_name',
    function (value, requirement, attribute) {
      const policy = Object.keys(value)[0];
      return allPolicyNames.includes(policy);
    },
    'Unknown policy name'
  );

  Validator.register(
    'service_exists',
    function (serviceName, requirement, attribute) {
      try {
        return (serviceName as string) in (config.services || {});
      } catch (e) {
        return false;
      }
    },
    'Unknown service'
  );

  Validator.register(
    'endpoint_exists',
    function (endpoint, requirement, attribute) {
      try {
        return (endpoint as string) in (config.endpoints || {});
      } catch (e) {
        return false;
      }
    },
    'Unknown endpoint'
  );

  const onlyUsedOnces: any = {};
  Validator.register(
    'endpoint_used_only_once',
    function (name, type, attribute) {
      if ((name as string) in onlyUsedOnces) {
        return false;
      }
      onlyUsedOnces[name as string] = true;
      return true;
    },
    "The same endpoint can't be linked to more than 1 pipeline"
  );
}
