const fs = require('fs');

const ENVS = [
  'API_URL',
  'PAGES_HOST',
  'SENTRY_DSN',
  'CONSOLE_URL',
  'SUGGESTIONS_ENDPOINT',
  'BILLING_HOME',
  'BILLING_USAGE',
];

const path = '/www/services/pages/.next/server/pages/';

function rewriteConfig(lang) {
  const errorFile = fs.readFileSync(`${path}/${lang}/404.html`);

  fs.writeFileSync(
    `${path}/${lang}/404.html`,
    ENVS.reduce(
      (prev, env) =>
        prev.replace(
          new RegExp(`"${env}":"[^\"]*"`),
          `"${env}":"${process.env[env] || 'changed'}"`
        ),
      `${errorFile}`
    )
  );
}

const langs = fs
  .readdirSync(path)
  .filter(
    (file) => file.match(/^[a-z]/) && fs.statSync(path + file).isDirectory()
  );
langs.forEach(rewriteConfig);
