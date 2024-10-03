export function isPrivateIP(ip: string) {
  if (ip === 'localhost' || ip === '127.0.0.1') {
    return true;
  }
  const parts = ip.split('.');
  return (
    parts[0] === '10' ||
    (parts[0] === '172' &&
      parseInt(parts[1], 10) >= 16 &&
      parseInt(parts[1], 10) <= 31) ||
    (parts[0] === '192' && parts[1] === '168')
  );
}
