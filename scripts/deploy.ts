import { promisify } from 'node:util';

import child from 'node:child_process';
const exec = promisify(child.exec);

async function isRepoClean() {
  const { stdout } = await exec('git status');
  return stdout.match('working tree clean');
}

async function getRmote() {
  const { stdout } = await exec('git remote');
  return stdout.split(/\n/)[0];
}

async function createNewVersion() {
  const { stdout: version } = await exec(`ts-node ${__dirname}/nexttag`);
  return version;
}

async function deploy() {
  if (!(await isRepoClean())) {
    console.error(
      'Repo is not clean. Commit or stash your current work and run the deploy command again.'
    );
    return process.exit(1);
  }
  const remote = await getRmote();
  await exec('git checkout main');
  await exec('git pull --rebase');
  await exec('git checkout prod');
  await exec('git pull --rebase');
  await exec('git merge main --no-ff');
  const version = await createNewVersion();
  await exec('git add package.json');
  await exec('git commit -m "deploy new version"');
  await exec(`git tag ${version}`);
  await exec(`git push ${remote} prod`);
  await exec('git checkout main');
  await exec('git merge prod --no-ff');
  await exec(`git push ${remote} main`);
}

deploy();
