function cleanOriginalName(name: string, template: string) {
  const asRegExp = template
    .replace('(', '\\(')
    .replace(')', '\\)')
    .replace('{{name}}', '([^\\d+]+)')
    .replace('{{n}}', '\\d+');

  const [, cleanedName] = name.match(new RegExp(asRegExp)) || [];
  return cleanedName || name;
}

export function incrementName(
  originalName: string,
  takenNames: string[],
  template = '{{name}} ({{n}})',
  {
    keepOriginal,
  }: {
    keepOriginal: boolean;
  } = { keepOriginal: false }
) {
  const cleanedOriginalName = keepOriginal
    ? originalName
    : cleanOriginalName(originalName, template);
  let newName = cleanedOriginalName;

  let version = 0;
  while (takenNames.includes(newName)) {
    newName = template
      .replace(/\{\{name\}\}/, cleanedOriginalName)
      .replace(/\{\{n\}\}/, `${++version}`);
  }

  return newName;
}
