import fs from 'fs';
import inquirer from 'inquirer';
import shell from 'shelljs-live';
import { exec } from 'shelljs';
import yaml from 'js-yaml';

const SERVICES = './services';
const DOCKERFILE = 'docker-compose.yml';
const DEV_SERVICE_CONFIG_PATH = '/tmp/prismeai';
const GATEWAY_SERVICE: string = 'api-gateway';
const SERVICES_PORTS: Record<string, string> = {
  console: '3000',
  [GATEWAY_SERVICE]: '3001',
  workspaces: '3002',
  runtime: '3003',
  events: '3004',
};

try {
  fs.mkdirSync(DEV_SERVICE_CONFIG_PATH);
} catch (e) {}

interface Service {
  service: string;
  dev: boolean;
}

const runDocker = (services: Service[]) => {
  const dockerSharedEnvs: Record<string, string> = {};
  if (services.find(({ service, dev }) => service === GATEWAY_SERVICE && dev)) {
    dockerSharedEnvs[
      'GATEWAY_API_HOST'
    ] = `http://host.docker.internal:${SERVICES_PORTS[GATEWAY_SERVICE]}`;
  }

  const dockerConfigs = services.map(({ service, dev }) => {
    const configPath = `${SERVICES}/${service}/${DOCKERFILE}`;
    const file = fs.readFileSync(configPath);
    const config: any = yaml.load(`${file}`);
    const devConfigPath = `${SERVICES}/${service}/docker-compose-dev.yml`;
    if (dev) {
      delete config.services[service];
    } else {
      config.services[service].environment = {
        ...config.services[service]?.environment,
        ...dockerSharedEnvs,
      };
      // Current service is gateway api from docker image :
      if (service === GATEWAY_SERVICE) {
        // Update any local service endpoint with docker host gateway
        const envs: Record<string, string> = services
          .filter(({ dev }) => dev)
          .reduce((envs, { service }) => {
            return {
              ...envs,
              [`${service.toUpperCase()}_API_URL`]: `http://host.docker.internal:${SERVICES_PORTS[service]}`,
            };
          }, {});

        config.services[service].environment = {
          ...config.services[service]?.environment,
          ...envs,
        };
      }
    }

    fs.writeFileSync(devConfigPath, yaml.dump(config));
    return {
      service,
      dev,
      path: devConfigPath,
    };
  });

  const command = [
    'docker-compose',
    ...dockerConfigs.reduce<string[]>(
      (prev, { path }) => [...prev, '-f', path],
      []
    ),
  ];
  shell([...command, '-p', 'prismeai', 'up'], { async: true });

  process.on('exit', () => {
    shell('docker-compose -p prismeai down');
  });
};

const getEnvs = (localServices: string[]): Record<string, string> => {
  if (localServices.includes(GATEWAY_SERVICE)) {
    // api gateway is in dev mode and must join dockerized other services
    return {
      WORKSPACES_API_URL: `http://localhost:${SERVICES_PORTS['workspaces']}`,
      RUNTIME_API_URL: `http://localhost:${SERVICES_PORTS['runtime']}`,
      CONSOLE_API_URL: `http://localhost:${SERVICES_PORTS['console']}`,
      EVENTS_API_URL: `http://localhost:${SERVICES_PORTS['events']}`,
    };
  }

  return {};
};

const listHealthyContainers = (): string => {
  const names = exec(
    `docker ps  --filter health=healthy  --format "{{.Names}}"`
  ).stdout;
  console.log('GOT : ', names);
  return names;
};

const waitForContainers = async (
  names: string[],
  timeout: number = 120000,
  interval: number = 5000
) => {
  return new Promise((resolve, reject) => {
    const time0 = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      if (now - time0 > timeout) {
        reject(new Error(`Timeout waiting for ${names.join(',')} containers`));
      }
      const healthyContainers = listHealthyContainers();
      if (names.every((cur) => healthyContainers.includes(cur))) {
        clearInterval(timer);
        resolve(true);
      }
    }, interval);
  });
};

const runLocal = (services: Service[]) => {
  const localServices = services.flatMap(({ service, dev }) =>
    dev ? service : []
  );
  const env = getEnvs(localServices);
  const command = localServices.map((s) => `"dev:${s}"`);
  const prefix = Object.keys(env).reduce(
    (prev, name) => `${prev} ${name}=${env[name]}`,
    ''
  );
  shell(`${prefix} ./node_modules/.bin/npm-run-all -p ${command.join(' ')}`, {
    async: true,
  });
};

const init = async () => {
  const availablesServices = fs.readdirSync(SERVICES).filter((service) => {
    try {
      return fs.statSync(`${SERVICES}/${service}/${DOCKERFILE}`);
    } catch (e) {
      return false;
    }
  });
  const { services: docker } = await inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Select services to run from build image',
      name: 'services',
      choices: availablesServices.map((name) => ({ name, checked: true })),
    },
  ]);

  const services = availablesServices.map((service) => ({
    service,
    dev: !docker.includes(service),
  }));

  runDocker(services);

  await waitForContainers(['elastic']);

  runLocal(services);
};
init();
