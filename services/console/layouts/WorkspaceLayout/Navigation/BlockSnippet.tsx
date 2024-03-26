function getValue(type: Prismeai.TypedArgument['type']) {
  switch (type) {
    case 'number':
    case 'localized:number':
      return 0;
    case 'boolean':
    case 'localized:boolean':
      return true;
    case 'string':
    case 'localized:string':
      return "''";
    case 'array':
      return '[]';
    case 'object':
    default:
      return '{}';
  }
}

function listArguments(schema: Prismeai.Block['schema']) {
  if (!schema || schema.type !== 'object') return '';
  return Object.entries(schema.properties || {})
    .map(([slug, { type }]) => `    ${slug}: ${getValue(type)}`)
    .join('\n');
}

export const BlockSnippet = ({
  slug,
  schema,
}: Prismeai.Block & { slug: string }) => {
  return (
    <div className="mt-1 text-xs">
      <pre>
        <code>{`- ${slug}:
${listArguments(schema)}
`}</code>
      </pre>
    </div>
  );
};
export default BlockSnippet;
