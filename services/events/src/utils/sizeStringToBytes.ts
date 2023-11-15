export function sizeStringToBytes(str: string) {
  if (str.endsWith('tb')) {
    return parseInt(str.slice(0, -2)) * 1000000000000;
  }
  if (str.endsWith('gb')) {
    return parseInt(str.slice(0, -2)) * 1000000000;
  }
  if (str.endsWith('mb')) {
    return parseInt(str.slice(0, -2)) * 1000000;
  }
  if (str.endsWith('kb')) {
    return parseInt(str.slice(0, -2)) * 1000;
  }
  if (str.endsWith('b') && parseInt(str.slice(-2, -1))) {
    return parseInt(str.slice(0, -1));
  }
  return false;
}
