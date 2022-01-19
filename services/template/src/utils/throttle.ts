interface ThrottleOptions {
  defaultReturn?: any;
}
export function throttle(
  func: (...args: any[]) => any,
  timeFrame: number,
  opts: ThrottleOptions
) {
  let lastTime = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastTime >= timeFrame) {
      const result = func(...args);
      lastTime = now;
      return result;
    } else {
      return opts?.defaultReturn;
    }
  };
}
