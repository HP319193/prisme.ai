import api from '../../console/utils/api';

export async function getBlocksConfigFromServer(
  page: Prismeai.DetailedPage,
  query = {},
  language = 'en'
) {
  const { workspaceId } = page;
  if (!workspaceId) return [];

  const blocks = page.blocks || [];
  let pageWithConfig = { ...page };

  if (page.automation) {
    try {
      const config = await api.callAutomation(
        workspaceId,
        page.automation,
        query
      );
      return {
        ...pageWithConfig,
        ...config,
      };
    } catch (e) {
      console.log(e);
    }
  }

  await Promise.all(
    blocks.map(
      async (
        {
          config: oldSchoolConfig = {},
          automation = oldSchoolConfig?.automation,
        },
        index
      ) => {
        if (!automation) return;
        try {
          const config = await api.callAutomation(
            workspaceId,
            automation,
            query
          );
          pageWithConfig.blocks = pageWithConfig.blocks || [];
          pageWithConfig.blocks[index] = {
            ...pageWithConfig.blocks[index],
            ...config,
          };
        } catch {}
      }
    )
  );

  return pageWithConfig;
}
