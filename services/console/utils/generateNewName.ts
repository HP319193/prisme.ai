export const generateNewName = (
  defaultName: string,
  currentList: any[],
  localize: (localizedField: any) => string
) => {
  // const defaultName = t(`${type}.create.defaultName`);
  let version = 0;
  const generateName = () => `${defaultName}${version ? ` (${version})` : ''}`;
  const names = currentList.map((name) => {
    return localize(name);
  });
  while (names.find((name) => name === generateName())) {
    version++;
  }
  return generateName();
};
