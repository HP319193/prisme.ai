let localStorage: Storage | undefined;
try {
  localStorage = global.localStorage || {};
} catch {}

export default localStorage
