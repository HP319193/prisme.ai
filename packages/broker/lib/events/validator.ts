import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import ajv from 'ajv';
import fetch from 'node-fetch';
import { EventValidationError } from '../errors';

const ajValidator = new ajv({ allErrors: true, strict: 'log' });
let schemaMapping: Record<string, string> = {};
let whitelistedEventPrefixes: string[] = [];

async function saveOAS(content: string, filepath: string) {
  const directory = path.dirname(filepath);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(filepath, content);
}

async function fetchOAS(
  filepath: string,
  url?: string
): Promise<{ data: any; url: string }> {
  try {
    return {
      data: yaml.load(fs.readFileSync(filepath).toString()) as object,
      url: filepath,
    };
  } catch (error) {
    if (!url) {
      throw new Error(`Invalid OAS found at ${filepath} : ${error}`);
    }
  }

  if (url) {
    try {
      const resp = await (await fetch(url)).text();
      if (filepath) {
        try {
          saveOAS(resp, filepath);
        } catch (error) {
          console.error(
            `Could not save downloaded events swagger to ${filepath} : ${error}`
          );
        }
      }

      const oas = yaml.load(resp as any);
      return {
        data: oas as object,
        url: url,
      };
    } catch (error) {
      throw new Error(`Invalid OAS found at ${url} : ${error}`);
    }
  }
  throw new Error('Missing a valid events OAS file.');
}

let ajvInitialized = false;
export interface ValidatorOptions {
  oasFilepath: string;
  oasUrl?: string;
  whitelistEventPrefixes?: string[];
}
export async function init({
  oasFilepath,
  oasUrl,
  whitelistEventPrefixes,
}: ValidatorOptions) {
  // Avoid ajv exception when instantiating multiple brokers
  if (ajvInitialized) {
    return true;
  }
  ajvInitialized = true;
  whitelistedEventPrefixes = whitelistEventPrefixes || [];

  const { data } = await fetchOAS(oasFilepath, oasUrl);
  delete data.openapi;
  delete data.info;
  delete data.servers;
  delete data.security;
  delete data.paths;
  //@ts-ignore
  ajValidator.addKeyword('components', {});
  //@ts-ignore
  ajValidator.addKeyword('example', {});
  Object.entries(data?.components?.schemas).forEach(
    ([componentName, component]: [string, any]) => {
      const typeProperty =
        component && component.properties && component.properties.type;
      const eventType = typeProperty
        ? typeProperty.example || (typeProperty.enum && typeProperty.enum[0])
        : '';
      if (!eventType) {
        return;
      }
      schemaMapping[eventType] = componentName;
    }
  );

  Object.entries(data.components?.schemas).forEach(([type, schema]: any) => {
    ajValidator.addSchema(schema, type);
  });
  return true;
}

export function validate(eventType: string, payload: any) {
  if (
    whitelistedEventPrefixes.length &&
    whitelistedEventPrefixes.some((prefix) => eventType.startsWith(prefix))
  ) {
    return true;
  }
  const componentName = schemaMapping[eventType];
  if (!componentName) {
    throw new EventValidationError(`Unknown event ${eventType}`, []);
  }
  const validated = ajValidator.validate(componentName, {
    type: eventType,
    payload,
  });

  if (!validated) {
    throw new EventValidationError(
      `Trying to send an invalid '${eventType}' event`,
      ajValidator.errors
    );
  }
  return validated;
}
