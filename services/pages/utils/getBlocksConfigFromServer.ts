import { generateEndpoint } from '../../console/utils/urls';

export async function getBlocksConfigFromServer(
  page: Prismeai.DetailedPage,
  query = {},
  language = 'en'
) {
  const { workspaceId } = page;
  if (!workspaceId) return [];

  async function callAutomation(automation: string) {
    if (!workspaceId) return {};
    const res = await fetch(generateEndpoint(workspaceId, automation), {
      method: 'post',
      body: JSON.stringify(query),
      headers: {
        'x-prismeai-api-key': page.apiKey,
        'Content-Type': 'application/json',
        'accept-language': language,
      },
    });
    return await res.json();
  }

  const blocks = page.blocks || [];
  let pageWithConfig = { ...page };

  if (page.automation) {
    try {
      const config = await callAutomation(page.automation);
      return {
        ...pageWithConfig,
        ...config,
      };
    } catch {}
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
          const config = await callAutomation(automation);
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
