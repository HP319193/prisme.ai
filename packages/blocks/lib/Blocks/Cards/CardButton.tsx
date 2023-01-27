import { FC } from 'react';
import useLocalizedText from '../../useLocalizedText';
import { useBlock } from '../../Provider';
import { useBlocks } from '../../Provider/blocksContext';
import tw from '../../tw';
import { RichText } from '../RichText';
import { CardButtonType } from './types';

const CardButton: FC<CardButtonType> = ({
  url,
  popup,
  event,
  icon,
  value,
  payload,
  className = 'flex flex-1 flex-row bg-[#E6EFFF] text-[10px] text-accent p-4 rounded text-left',
}) => {
  const { localize } = useLocalizedText();
  const { events } = useBlock();

  const {
    components: { Link },
  } = useBlocks();
  if (url) {
    return (
      <Link
        href={url}
        className={tw`card-content-outer__button-link button-link ${className}`}
        target={popup ? '_blank' : undefined}
      >
        <div
          className={tw`button-link__image-container image-container flex mr-2`}
        >
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="image-container__image image image-container__image--custom image--custom"
              src={icon}
              alt={localize(value)}
              height={16}
              width={16}
            />
          )}
        </div>
        <RichText>{localize(value)}</RichText>
      </Link>
    );
  }
  if (event) {
    return (
      <button
        type="button"
        className={tw`block-cards__button-event button-event ${className}`}
        onClick={() => events?.emit(event, payload)}
      >
        <div
          className={tw`button-event__image-container image-container flex mr-2`}
        >
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="image-container__image--custom image--custom"
              src={icon}
              alt={localize(value)}
              height={16}
              width={16}
            />
          )}
        </div>
        <RichText>{localize(value)}</RichText>
      </button>
    );
  }
  return <RichText>{localize(value)}</RichText>;
};

export default CardButton;
