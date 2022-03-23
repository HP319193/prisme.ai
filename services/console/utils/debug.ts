// @ts-nocheck
export const addDebug = (name: string, fn: Function) => {
  window.Prisme = window.Prisme || {};
  window.Prisme.ai = window.Prisme.ai || {};
  window.Prisme.ai[name] = fn;
};

export default addDebug;
