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
    const { slug, payload = {} } =
      typeof page.automation === 'string'
        ? {
            slug: page.automation,
          }
        : page.automation;
    try {
      if (!slug) {
        throw new Error('No automation slug');
      }
      const config = await api.callAutomation(workspaceId, slug, query);
      return {
        ...pageWithConfig,
        ...config,
        ...payload,
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
        const { slug, payload = {} } =
          typeof automation === 'string'
            ? {
                slug: automation,
              }
            : automation;
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
