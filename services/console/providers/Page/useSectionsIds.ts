import { usePage } from './PageProvider';

interface SectionId {
  id: string;
  name: string;
}
interface Config {
  sectionId?: string;
  slug: string;
}

function extractSectionsId(configs: Config[]): SectionId[] {
  return configs.flatMap((config) => {
    let ids: any[] = [];
    if (config.sectionId) {
      ids = [{ id: config.sectionId, name: config.slug }];
    }
    Object.values(config).forEach((item) => {
      if (!Array.isArray(item)) return;
      ids = [...ids, ...extractSectionsId(item)];
    });
    return ids;
  });
}

export function useSectionsIds() {
  const { page } = usePage();
  const { blocks } = page;
  return extractSectionsId(
    (blocks || []).map(({ config, slug }) => ({ ...config, slug } || {})) || []
  );
}

export default useSectionsIds;
