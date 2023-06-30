import { InputRef, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useLocalizedText from '../../utils/useLocalizedText';
import { BlockInCatalog } from '../PageBuilder/useBlocks';
import { useTracking } from '../Tracking';
import removeAccents from 'remove-accents';
import SearchInput from '../Navigation/SearchInput';

interface BlockPickerProps {
  blocks: BlockInCatalog[];
  onAdd: (block: BlockInCatalog) => void;
}

export const BlockPicker = ({ blocks, onAdd }: BlockPickerProps) => {
  const { localize } = useLocalizedText();
  const { trackEvent } = useTracking();
  const { t } = useTranslation('workspaces');
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<InputRef>(null);

  useEffect(() => {
    setTimeout(() => searchInputRef.current?.focus(), 100);
  });

  const searchInBlock = useCallback(
    (
      block: BlockInCatalog,
      search: string
    ): (BlockInCatalog & {
      hidden?: boolean;
      variants?: BlockInCatalog[];
    })[] => {
      if (!search) return [block];

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

      if (filteredVariants === undefined) return [block];

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

  const blocksByCategory = useMemo(() => {
    const filtered = blocks.flatMap((block) => searchInBlock(block, search));

    return filtered.reduce<{ source: string; blocks: BlockInCatalog[] }[]>(
      (prev, item) => {
        const { hidden, builtIn, from: f, slug, name } = item;
        let from = f
          ? t('blocks.builder.picker.workspace', { from: f })
          : slug.replace(`.${name}`, '');
        if (hidden) return prev;
        const source = builtIn ? t('blocks.builder.picker.builtIn') : `${from}`;
        const newList = [...prev];
        let category = newList.find(({ source: s }) => source === s);
        if (!category) {
          category = { source, blocks: [] };
          newList.push(category);
        }
        category.blocks.push(item);
        return newList;
      },
      []
    );
  }, [blocks, search, searchInBlock, t]);

  return (
    <div className="flex flex-col">
      <div className="flex mb-0 flex-col">
        <SearchInput
          value={search}
          onChange={(e) => {
            trackEvent({
              name: 'Search Blocks',
              action: 'keydown',
            });
            setSearch(e);
          }}
          placeholder={t('pages.blocks.search')}
          autoFocus
        />
      </div>

      <div className="flex flex-1 flex-col overflow-auto max-h-[70vh] mb-4">
        {blocksByCategory.map(({ source, blocks }) => (
          <div key={source}>
            <div className="uppercase font-bold text-gray border-light-accent border-b py-4 px-8 mb-4">
              {source}
            </div>
            <div className="flex flex-1 px-4 flex-wrap items-baseline">
              {blocks.map((block, k) => (
                <Tooltip key={k} title={localize(block.description)}>
                  <button
                    type="button"
                    className={`w-1/3 flex flex-col self-stretch justify-between items-stretch`}
                    onClick={() => onAdd(block)}
                  >
                    <div
                      className="flex flex-col flex-1 border-light-accent
                     rounded
                     border p-2 m-2 bg-ultra-light-accent"
                    >
                      <div className="font-bold m-4">
                        {localize(block.name)}
                      </div>
                      <div className="flex flex-1 items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element*/}
                        <img
                          className="rounded-[2px]"
                          src={block.photo || '/images/blocks/preview.jpg'}
                          alt={localize(block.name)}
                        />
                      </div>
                    </div>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockPicker;
