import fs from 'fs';
import jsyaml from 'js-yaml';
import $RefParser from '@apidevtools/json-schema-ref-parser';

const [swaggerPath, outputPath] = process.argv.filter((part) =>
  part.match(/^\w/)
);

async function build() {
  const swagger: any = jsyaml.load(fs.readFileSync(swaggerPath).toString());
  const dereferenced: any = await $RefParser.dereference(
    jsyaml.load(
      fs.readFileSync(swaggerPath).toString()
    ) as $RefParser.JSONSchema,
    {
      dereference: {
        circular: 'ignore',
      },
    }
  );

  const instructions = swagger.components.schemas.Instruction.anyOf.reduce(
    (prev: any, { $ref: path = '' }: any, index: number) => {
      const match = path.split(/\//) || [];
      const name = match[match.length - 1];
      return name
        ? {
            ...prev,
            [name.toLowerCase()]:
              dereferenced.components.schemas[name] ||
              dereferenced.components.schemas.Instruction.anyOf[index] ||
              {},
          }
        : prev;
    },
    {}
  );
  if (!outputPath) return;
  const ouput = JSON.stringify(instructions, null, '  ')
    .split('"$ref": "#/components/schemas/InstructionList"')
    .join('"type": "array"')
    .split('"$ref": "#/components/schemas/Instruction"')
    .join('"type": "object"');
  fs.writeFileSync(outputPath, ouput);
}

build();
