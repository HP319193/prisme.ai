export function replaceCharacter(block: any, from: RegExp, to: string): any {
  if (!block || typeof block !== 'object') {
    return block;
  }
  if (Array.isArray(block)) {
    return block.map((value) => {
      return typeof value === 'object'
        ? replaceCharacter(value, from, to)
        : value;
    });
  }
  return Object.entries(block).reduce((prev, [key, value]) => {
    const finalKey = key.match(/^template/) ? key.replace(from, to) : key;
    const finalValue =
      typeof value === 'object' ? replaceCharacter(value, from, to) : value;
    return { ...prev, [finalKey]: finalValue };
  }, {});
}

export function removeTemplateDots(block: any): any {
  return replaceCharacter(block, /\./, '_');
}

export function getBackTemplateDots(block: any): any {
  return replaceCharacter(block, /_/, '.');
}
