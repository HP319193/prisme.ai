import { generateEndpoint } from '../../console/utils/urls';

export function getBlocksConfigFromServer(page: Prismeai.DetailedPage) {
  const { workspaceId } = page;
  if (!workspaceId) return [];
  const blocks = page.blocks || [];

  return Promise.all(
    blocks.map(
      async ({
        config: oldSchoolConfig = {},
        automation = oldSchoolConfig?.automation,
      }) => {
        if (!automation) return {};
        try {
          const config = await fetch(generateEndpoint(workspaceId, automation));
          return await config.json();
        } catch {}
        return {};
      }
    )
  );
}
