let localStorage;
try {
  localStorage = global.localStorage || {};
} catch {}

export default localStorage
