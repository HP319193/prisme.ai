export function toKebab(str: string) {
  return str.replace(/[^a-zA-Z0-9]/g, (m, m1) => '-');
}
