import fs from 'fs';
import inquirer from 'inquirer';
import shell from 'shelljs-live';
import yaml from 'js-yaml';

const SERVICES = './services';
const DOCKERFILE = 'docker-compose.yml';
const DEV_SERVICE_CONFIG_PATH = '/tmp/prismeai';
const GATEWAY_CONFIG = `${DEV_SERVICE_CONFIG_PATH}/prisme-gateway.yml`;

try {
  fs.mkdirSync(DEV_SERVICE_CONFIG_PATH);
} catch (e) {}

interface Service {
  service: string;
  dev: boolean;
}

const runDocker = (services: Service[]) => {
  const dockerConfigs = services.map(({ service, dev }) => {
    const configPath = `${SERVICES}/${service}/${DOCKERFILE}`;
    if (dev) {
      const file = fs.readFileSync(configPath);
      const config: any = yaml.load(`${file}`);
      delete config.services[service];
      const devConfigPath = `${SERVICES}/${service}/docker-compose-dev.yml`;
      fs.writeFileSync(devConfigPath, yaml.dump(config));
      return {
        service,
        dev,
        path: devConfigPath,
      };
    }
    return {
      service,
      dev,
      path: configPath,
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
  if (localServices.includes('api-gateway')) {
    // api gateway is in dev mode and must join dockerized other services
    try {
      const original = fs.readFileSync(
        './services/api-gateway/gateway.config.yml'
      );
      const newConfig = `${original}`.replace(/(url\:\s").+(:\d+")/g, (m) => {
        return m.replace(/(url\:\s").+(:\d+")/, '$1http://localhost$2');
      });
      fs.writeFileSync(GATEWAY_CONFIG, newConfig);
      return {
        GATEWAY_CONFIG_PATH: GATEWAY_CONFIG,
      };
    } catch (e) {}
  }

  return {};
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
  // const availablesServices = fs.readdirSync(SERVICES).filter((service) => {
  //   try {
  //     return fs.statSync(`${SERVICES}/${service}/${DOCKERFILE}`);
  //   } catch (e) {
  //     return false;
  //   }
  // });
  const availablesServices = ['events'];

  const { services: docker } = await inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Select services to run from build image',
      name: 'services',
      choices: [
        ...[availablesServices].map((name) => ({ name, checked: true })),
      ],
    },
  ]);

  const services = availablesServices.map((service) => ({
    service,
    dev: !docker.includes(service),
  }));

  runDocker(services);

  runLocal(services);
};

init();
