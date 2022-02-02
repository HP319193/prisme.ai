import fs from 'fs';
import inquirer from 'inquirer';
import shell from 'shelljs-live';

const SERVICES = './services';
const DOCKERFILE = 'docker-compose.yml';

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

const runLocal = (services: string[]) => {
  const command = services.map((s) => `"dev:${s}"`);
  shell(`./node_modules/.bin/npm-run-all ${command.join(' ')}`, {
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

  const run = await inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Select services to run from build image',
      name: 'services',
      choices: [...services.map((name) => ({ name, checked: true }))],
    },
  ]);

  runDocker(run.services);
  runLocal(services.filter((s) => !run.services.includes(s)));
};

init();
