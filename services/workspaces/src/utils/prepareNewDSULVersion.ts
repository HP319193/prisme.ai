import { MAXIMUM_WORKSPACE_VERSION } from '../../config';
import { InvalidVersionError } from '../errors';

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ValidatedDSULVersion = RequiredFields<
  Prismeai.WorkspaceVersion,
  'name' | 'createdAt' | 'description'
>;

export function prepareNewDSULVersion(
  currentVersions: ValidatedDSULVersion[],
  versionRequest: Prismeai.WorkspaceVersion,
  maximumVersions: number = MAXIMUM_WORKSPACE_VERSION
): {
  newVersion: ValidatedDSULVersion;
  allVersions: ValidatedDSULVersion[];
  expiredVersions: ValidatedDSULVersion[];
} {
  if (
    versionRequest.name &&
    !/^[a-zA-Z0-9_.-]{1,15}$/.test(versionRequest.name)
  ) {
    throw new InvalidVersionError(
      `Invalid version name '${versionRequest.name}' : must be between 1 & 15 characters and include only alphabetical letters, numbers, _, - and .`
    );
  }
  if (
    versionRequest.name &&
    currentVersions.some((cur) => cur.name == versionRequest.name)
  ) {
    throw new InvalidVersionError(
      `Invalid version name '${versionRequest.name}' : already used`
    );
  }
  if (versionRequest.name == 'current') {
    throw new InvalidVersionError(
      `Invalid version name '${versionRequest.name}' : reserved name`
    );
  }
  const generateName = () => {
    const curDate = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
    let idx = 1;
    let curName = `${curDate}.${idx}`;
    while (currentVersions.some((cur) => cur.name == curName)) {
      idx++;
      curName = `${curDate}.${idx}`;
    }
    // Here we add a timestamp to ensure tag unicity accross environments (git synchronization)
    return curName + `-${Date.now()}`;
  };
  const newVersion = {
    createdAt: `${new Date().toISOString()}`,
    ...versionRequest,
    name: versionRequest?.name || generateName(),
  };
  const expiredVersions =
    currentVersions.length + 1 > maximumVersions
      ? currentVersions.slice(maximumVersions - 1)
      : [];

  return {
    newVersion,
    allVersions: [newVersion, ...currentVersions.slice(0, maximumVersions - 1)],
    expiredVersions,
  };
}
