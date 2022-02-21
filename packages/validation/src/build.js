const fs = require('fs');
const yaml = require('js-yaml');

const schema = fs.readFileSync(
  `${__dirname}/../../../specifications/swagger.yml`
);
const json = yaml.load(`${schema}`);
const validators = Object.keys(json.components.schemas);
const file = `
import Ajv from "ajv";
const schemas = ${JSON.stringify(json)}
// @ts-ignore
const ajv = new Ajv({ strict: false });
ajv.addSchema(schemas, "swagger");
${validators
  .map(
    (validator) => `
export const validate${validator} = ajv.compile({
  $ref: 'swagger#/components/schemas/${validator}'
});
`
  )
  .join('')}
export default ajv
`;

fs.writeFileSync(`${__dirname}/../index.ts`, file);
