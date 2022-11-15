const fs = require('fs');

const ENVS = ['API_HOST', 'PAGES_HOST', 'SENTRY_DSN', 'CONSOLE_HOST'];

//services/pages/.next/server/pages/default/404.html
function rewriteConfig() {
  const errorFile = fs.readFileSync(
    '/www/services/pages/.next/server/pages/default/404.html'
  );

  fs.writeFileSync(
    '/www/services/pages/.next/server/pages/default/404.html',
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
rewriteConfig();
