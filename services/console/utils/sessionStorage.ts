let sessionStorage: Storage | undefined;
try {
  sessionStorage = global.sessionStorage || {};
} catch {}

export default sessionStorage;
