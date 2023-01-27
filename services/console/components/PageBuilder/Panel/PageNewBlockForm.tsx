import {
  Collapse,
  SearchInput,
  Space,
  Tooltip,
} from '@prisme.ai/design-system';
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
      if (!search) return block;

      function lookIn(into: string) {
        return removeAccents(into)
          .toLowerCase()
          .includes(removeAccents(search.toLowerCase()));
      }

      const fullBlockSearchIn = `${localize(block.name)} ${localize(
        block.description
      )} ${block.slug} ${(block.variants || [])
        .map(
          ({ name, slug, description }) =>
            `${localize(name)} ${localize(description)} ${slug}`
        )
        .join(' ')}`;

      if (!lookIn(fullBlockSearchIn)) return [];

      const filteredVariants = block.variants
        ? block.variants.filter(({ name, description, slug }) =>
            lookIn(`${localize(name)} ${localize(description)} ${slug}`)
          )
        : undefined;

      if (filteredVariants === undefined) return block;

      if (filteredVariants.length === 0) return [];

      return [
        {
          ...block,
          hidden: !lookIn(
            `${localize(block.name)} ${localize(block.description)} ${
              block.slug
            }`
          ),
          variants: filteredVariants,
        },
      ];
    },
    [localize]
  );

  const filteredCatalog: (BlockInCatalog & {
    hidden?: boolean;
  })[] = useMemo(() => {
    return catalog.flatMap((block) => searchInBlock(block, search));
  }, [catalog, search, searchInBlock]);

  const collapses = useMemo(
    () =>
      filteredCatalog.map(
        ({ slug, name, variants, hidden, description, from, ...block }) => {
          return {
            key: slug,
            label: (
              <Tooltip
                title={
                  <>
                    <span>{localize(description) || localize(name)}</span>
                    {from && <span className="italic ml-2">({from})</span>}
                  </>
                }
              >
                <div className="flex flex-1">{localize(name)}</div>
              </Tooltip>
            ),
            content: (
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
            ),
          };
        }
      ),
    [filteredCatalog, localize, onSubmit]
  );

  return (
    <div className="flex flex-1 h-full flex-col p-4">
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('pages.blocks.search')}
        className="mb-6"
      />
      <Space direction="vertical" className="flex flex-1 overflow-x-auto -m-5">
        <Collapse items={collapses} />
      </Space>
    </div>
  );
};

export default PageNewBlockForm;
