export function kebabToCamel(str: string) {
  return str.replace(/-([a-z])/g, (m, m1) => m1.toUpperCase());
}

export function keysKebabToCamel(o: Record<string, any>) {
  return Object.entries(o).reduce(
    (prev, [k, v]) => ({
      ...prev,
      [kebabToCamel(k)]: v,
    }),
    {}
  );
}
