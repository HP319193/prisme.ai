export function extractConfigFromEnv(type: 'workspace' | 'app', slug: string) {
  slug = (slug || '').replace(/ /g, '');
  const prefix =
    type === 'app' ? `APP_CONFIG_${slug}_` : `WORKSPACE_CONFIG_${slug}_`;
  return Object.entries(process.env).reduce(
    (config, [key, value]) =>
      key.startsWith(prefix)
        ? {
            ...config,
            [key.slice(prefix.length)]: value,
          }
        : config,
    {}
  );
}
