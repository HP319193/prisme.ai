import yaml from "js-yaml";

declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

self.onmessage = ({ data: { action, data, id } }) => {
  try {
    let message;
    switch (action) {
      case "load":
        message = yaml.load(data);
        break;
      case "dump":
        message = yaml.dump(data, {
          noRefs: true,
          styles: {
            "!!null": "empty",
          },
        });
        break;
    }
    self.postMessage({ id, data: message });
  } catch (error) {
    self.postMessage({ id, error });
  }
};
