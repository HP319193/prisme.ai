import { PageBuilderContext } from '../../components/PageBuilder/context';

export function cleanValue(value: Prismeai.Page, pageId: Prismeai.Page['id']) {
  return {
    ...value,
    blocks: ((value.blocks || []) as PageBuilderContext['page']['blocks']).map(
      ({ key, ...block }) => block
    ),
    id: pageId,
  };
}
