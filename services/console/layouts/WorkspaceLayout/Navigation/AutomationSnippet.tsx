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

function listArguments(args: Prismeai.Automation['arguments']) {
  if (!args) return '';
  return Object.entries(args)
    .map(([slug, { type }]) => `    ${slug}: ${getValue(type)}`)
    .join('\n');
}

export const AutomationSnippet = ({
  slug,
  arguments: args,
}: Prismeai.AutomationMeta) => {
  return (
    <div className="mt-1 text-xs">
      <pre>
        <code>{`- ${slug}:
${listArguments(args)}
`}</code>
      </pre>
    </div>
  );
};
export default AutomationSnippet;
