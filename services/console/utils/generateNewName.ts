export const generateNewName = (
  defaultName: string,
  currentList: any[],
  localize: (localizedField: any) => string,
  startingVersion: number = 0,
  useHyphen?: boolean
) => {
  let version = startingVersion;
  let generateName: Function;
  if (useHyphen) {
    generateName = () => `${defaultName}${version ? `_${version}` : ''}`;
  } else {
    generateName = () => `${defaultName}${version ? ` (${version})` : ''}`;
  }
  const names = currentList.map((name) => {
    return localize(name);
  });

  while (names.find((name) => name === generateName())) {
    version++;
  }
  return generateName();
};
