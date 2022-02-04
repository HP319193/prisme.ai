import fs from 'fs';
import inquirer from 'inquirer';
import shell from 'shelljs-live';

const SERVICES = './services';
const DOCKERFILE = 'docker-compose.yml';
const GATEWAY_CONFIG = '/tmp/prisme-gateway.yml';

const runDocker = (services: string[]) => {
  const command = [
    'docker-compose',
    ...services.reduce<string[]>(
      (prev, service) => [
        ...prev,
        '-f',
        `${SERVICES}/${service}/${DOCKERFILE}`,
      ],
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
        return m.replace(/(url\:\s").+(:\d+")/, '$1localhost$2');
      });
      fs.writeFileSync(GATEWAY_CONFIG, newConfig);
      return {
        GATEWAY_CONFIG_PATH: GATEWAY_CONFIG,
      };
    } catch (e) {}
  }

  return {};
};

const runLocal = (services: string[], env: Record<string, string> = {}) => {
  const command = services.map((s) => `"dev:${s}"`);
  const prefix = Object.keys(env).reduce(
    (prev, name) => `${prev} ${name}=${env[name]}`,
    ''
  );
  shell(`${prefix} ./node_modules/.bin/npm-run-all -p ${command.join(' ')}`, {
    async: true,
  });
};

const init = async () => {
  const services = fs.readdirSync(SERVICES).filter((service) => {
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
      choices: [...services.map((name) => ({ name, checked: true }))],
    },
  ]);

  const local = services.filter((s) => !docker.includes(s));

  runDocker(docker);
  const env = getEnvs(local);
  runLocal(local, env);
};

init();
