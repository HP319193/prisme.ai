export function extractOptsFromEnv(prefix: string) {
  return Object.entries(process.env).reduce(
    (opts: Record<string, string>, [k, v]) => {
      if (!k.startsWith(prefix)) {
        return opts;
      }
      return {
        ...opts,
        [k.slice(prefix.length)]: v as string,
      };
    },
    {}
  );
}
