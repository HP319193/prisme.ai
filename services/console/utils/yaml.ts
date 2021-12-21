let worker: any;

export const useYaml = () => {
  if (!worker) {
    worker = new Worker(new URL("./yaml.worker", import.meta.url));
  }
  const call = <T>(action: string, data: any): Promise<T> =>
    new Promise((resolve, reject) => {
      const requestId = Math.random();
      const callback = ({ data: { id, data, error } }: MessageEvent) => {
        if (id !== requestId) return;
        if (error) reject(error);
        else resolve(data);
        worker.removeEventListener("message", callback);
      };
      worker.addEventListener("message", callback);
      worker.postMessage({ action, data, id: requestId });
    });
  const toJSON = async <T>(value: string) => {
    return await call<T>("load", value);
  };
  const toYaml = async <T>(value: T) => {
    return await call<string>("dump", value);
  };
  return { toYaml, toJSON };
};

export default useYaml;
