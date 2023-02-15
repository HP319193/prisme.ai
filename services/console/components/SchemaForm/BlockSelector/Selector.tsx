import { Select, Tooltip } from '@prisme.ai/design-system';
import { useCallback, useMemo } from 'react';
import useLocalizedText from '../../../utils/useLocalizedText';
import { useBlockSelector } from './BlockSelectorProvider';

export interface SchemaSelectorProps {
  id?: string;
  value: string;
  onChange: (v: string) => void;
}

export const Selector = ({ id = '', value, onChange }: SchemaSelectorProps) => {
  const { blocks } = useBlockSelector();
  const { localize } = useLocalizedText();
  const selectOptions = useMemo(
    () =>
      blocks.map(({ slug, name, description, photo }) => ({
        label: (
          <Tooltip
            title={
              localize(description) ? (
                <>
                  {localize(description)}
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={localize(name)}
                      className="bg-white rounded"
                    />
                  )}
                </>
              ) : (
                ''
              )
            }
          >
            <div className="flex flex-1">{localize(name)}</div>
          </Tooltip>
        ),
        value: slug,
      })),
    [blocks, localize]
  );

  const filterOption = useCallback(
    (input: string, options: any) => {
      const block = blocks.find(({ slug }) => slug === options.value);
      if (!block) return false;
      const search = `${block.slug} ${localize(block.name)} ${localize(
        block.description
      )}`.toLowerCase();
      return search.includes(input);
    },
    [blocks, localize]
  );

  return (
    <Select
      id={id}
      selectOptions={selectOptions}
      value={value}
      onChange={onChange}
      showSearch
      filterOption={filterOption}
    />
  );
};

export default Selector;
