import { Tooltip } from '@prisme.ai/design-system';
import { DOMAttributes } from 'react';
import useLocalizedText from '../../../utils/useLocalizedText';
import { BlockInCatalog } from '../useBlocks';

interface BlockButtonProps extends BlockInCatalog {
  onClick?: DOMAttributes<HTMLButtonElement>['onClick'];
  isVariant?: boolean;
}

export const BlockButton = ({
  name,
  from,
  description,
  photo,
  onClick,
  isVariant,
  builtIn,
  icon,
}: BlockButtonProps) => {
  const { localize } = useLocalizedText();

  return (
    <Tooltip
      title={
        <>
          <span>{localize(description) || localize(name)}</span>
          {from && <span className="italic ml-2">({from})</span>}
        </>
      }
    >
      <button className="flex flex-col m-5 relative" onClick={onClick}>
        {icon && (
          <Tooltip title={from}>
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={icon}
                alt={localize(name)}
                className="absolute bottom-2 left-2 w-7 h-7"
              />
            }
          </Tooltip>
        )}
        <div>
          <span>{isVariant ? localize(name) : ' '}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element*/}
        <img
          className="rounded-[2px]"
          src={photo || '/images/blocks/preview.jpg'}
          alt={localize(name)}
        />
      </button>
    </Tooltip>
  );
};
export default BlockButton;
