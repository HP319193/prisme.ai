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
  const localizedDescription = localize(description);

  return (
    <Tooltip
      title={
        <>
          <span>{localizedDescription || localize(name)}</span>
          {from && <span className="italic ml-2">({from})</span>}
        </>
      }
    >
      <button className="flex flex-col m-1 relative" onClick={onClick}>
        {icon && (
          <Tooltip title={from}>
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={icon}
                alt={localize(name)}
                className="absolute bottom-1 left-1 w-8 h-8"
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
          style={{
            outline: '1px solid rgba(0,0,0,.1)',
          }}
          src={photo || '/images/blocks/preview.jpg'}
          alt={localize(name)}
          width="145"
        />
      </button>
    </Tooltip>
  );
};
export default BlockButton;
