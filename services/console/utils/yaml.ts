import { ErrorParameters } from "ajv";

export interface ValidationError {
  instancePath: string;
  keyword: string;
  message: string;
  params: ErrorParameters;
  schemaPath: string;
}

export const getLineNumber = (yaml: string, path: string) => {
  const lines = yaml.split(/\n/).map((line, index) => {
    const [key] = line.split(/\:/);
    const [, indent = "", name] = key.match(/(\s+)(.*$)/) || [];
    return {
      line: index + 1,
      indent: indent.length / 2,
      name: name || key,
    };
  });
  const pathParts = `${path}`.replace(/^\//, "").split(/\//);
  let line = 0;

  pathParts.forEach((part, index) => {
    const found = lines
      .filter(
        ({ indent, line: lineNumber }) => indent === index && lineNumber > line
      )
      .find(({ name }) => name === part);

    if (!found) {
      throw new Error("not found");
    }
    line = found.line;
  });

  return line;
};
