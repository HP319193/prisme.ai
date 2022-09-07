import { SearchInput, Space } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import useLocalizedText from '../../../utils/useLocalizedText';
import { usePageBuilder } from '../context';
import { BlockInCatalog } from '../useBlocks';
import BlockButton from './BlockButton';
import removeAccents from 'remove-accents';

interface PageNewBlockFormProps {
  onSubmit: (blockSlug: string) => void;
}

export const PageNewBlockForm = ({ onSubmit }: PageNewBlockFormProps) => {
  const { catalog } = usePageBuilder();

  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const [search, setSearch] = useState('');

  const searchInBlock = useCallback(
    (block: BlockInCatalog, search: string) => {
      const isFound = (block: BlockInCatalog, search: string) => {
        return removeAccents(
          `${localize(block.name)} ${localize(block.description)}`.toLowerCase()
        ).includes(removeAccents(search.toLowerCase()));
      };
      if (!block.variants) {
        return isFound(block, search) ? [block] : [];
      }
      return {
        ...block,
        hidden: !isFound(block, search),
      };
    },
    [localize]
  );

  const filteredCatalog: (BlockInCatalog & {
    hidden?: boolean;
  })[] = useMemo(() => {
    return catalog.flatMap((block) => searchInBlock(block, search));
  }, [catalog, search, searchInBlock]);

  return (
    <div className="flex flex-1 h-full flex-col overflow-auto">
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('pages.blocks.search')}
        className="mb-6"
      />
      <Space direction="vertical" className="flex flex-1 overflow-x-auto">
        {filteredCatalog.map(({ slug, name, variants, hidden, ...block }) => (
          <Space
            key={slug}
            direction="vertical"
            className="!flex flex-1 pb-2 border-b-2"
          >
            <div className="font-bold">{localize(name)}</div>
            <div className={`flex flex-wrap ${hidden ? '' : '-mt-8'}`}>
              {!hidden && (
                <BlockButton
                  slug={slug}
                  name={name}
                  {...block}
                  onClick={() => onSubmit(slug)}
                />
              )}

              {variants &&
                Array.isArray(variants) &&
                variants.map((block) => (
                  <BlockButton
                    key={block.slug}
                    {...block}
                    onClick={() => onSubmit(block.slug)}
                    isVariant
                  />
                ))}
            </div>
          </Space>
        ))}
      </Space>
    </div>
  );
};

export default PageNewBlockForm;
