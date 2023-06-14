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
import { useTracking } from '../../Tracking';

interface PageNewBlockFormProps {
  onSubmit: (blockSlug: string) => void;
}

export const PageNewBlockForm = ({ onSubmit }: PageNewBlockFormProps) => {
  const { catalog } = usePageBuilder();
  const { trackEvent } = useTracking();

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
        ({
          slug,
          name,
          variants,
          hidden,
          description,
          from,
          builtIn,
          ...block
        }) => {
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
                    onClick={() => {
                      trackEvent({
                        name: `Choose ${builtIn ? 'BuiltIn' : 'Custom'} Block`,
                        action: 'click',
                      });
                      onSubmit(slug);
                    }}
                  />
                )}

                {variants &&
                  Array.isArray(variants) &&
                  variants.map((block) => (
                    <BlockButton
                      key={block.slug}
                      {...block}
                      onClick={() => {
                        trackEvent({
                          name: `Choose ${
                            builtIn ? 'BuiltIn' : 'Custom'
                          } Block`,
                          action: 'click',
                        });
                        onSubmit(block.slug);
                      }}
                      isVariant
                    />
                  ))}
              </div>
            ),
          };
        }
      ),
    [filteredCatalog, localize, onSubmit, trackEvent]
  );

  return (
    <div className="flex flex-1 h-full flex-col p-4">
      <SearchInput
        value={search}
        onChange={(e) => {
          trackEvent({
            name: 'Search Blocks',
            action: 'keydown',
          });
          setSearch(e.target.value);
        }}
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
