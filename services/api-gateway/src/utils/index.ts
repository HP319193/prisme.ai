export function extractOptsFromEnv(prefix: string) {
  return Object.entries(process.env)
    .filter(([key]) => key.startsWith(prefix))
    .reduce((env, [k, v]: [string, any]) => {
      if (v === 'true') {
        v = true;
      } else if (v === 'false') {
        v = false;
      } else if (parseInt(v)) {
        v = parseInt(v);
      }
      return {
        ...env,
        [k.slice(prefix.length)]: v,
      };
    }, {});
}
