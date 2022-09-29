import { MAXIMUM_WORKSPACE_VERSION } from '../../config';
import { InvalidVersionError } from '../errors';

export function prepareNewDSULVersion(
  currentVersions: Required<Prismeai.WorkspaceVersion>[],
  versionRequest: Prismeai.WorkspaceVersion,
  maximumVersions: number = MAXIMUM_WORKSPACE_VERSION
): {
  newVersion: Required<Prismeai.WorkspaceVersion>;
  allVersions: Required<Prismeai.WorkspaceVersion>[];
  expiredVersions: Required<Prismeai.WorkspaceVersion>[];
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
    return curName;
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
