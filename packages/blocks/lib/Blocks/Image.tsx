import { useBlock } from '../Provider';
import useLocalizedText from '../useLocalizedText';
import { BaseBlock } from './BaseBlock';
import { RichText } from './RichText';
import { BaseBlockConfig } from './types';

export interface ImageConfig extends BaseBlockConfig {
  caption?: Prismeai.LocalizedText;
  src?: string;
  alt?: string;
}

export const Image = ({
  className = '',
  caption,
  src = '',
  alt,
}: ImageConfig) => {
  const {localize } = useLocalizedText()
  return (
    <figure className={`pr-block-image ${className}`}>
      <img className="pr-block-image__image" src={src} loading="lazy" alt={localize(alt)} />
      {caption && (
        <figcaption className="pr-block-image__caption">
          <RichText>{localize(caption)}</RichText>
        </figcaption>
      )}
    </figure>
  )
};

export const ImageInContext = () => {
  const { config } = useBlock<ImageConfig>();
  return (
    <BaseBlock>
      <Image {...config} />
    </BaseBlock>
  );
};

export default ImageInContext;
