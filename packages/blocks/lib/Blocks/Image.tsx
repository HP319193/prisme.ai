import { useBlock } from '../Provider';
import { BaseBlock } from './BaseBlock';
import { RichText } from './RichText';
import { BaseBlockConfig } from './types';

export interface ImageConfig extends BaseBlockConfig {
  caption?: string;
  src?: string;
  alt?: string;
}

export const Image = ({
  className = '',
  caption,
  src = '',
  alt,
}: ImageConfig) => (
  <figure className={`pr-block-image ${className}`}>
    <img className="pr-block-image__image" src={src} loading="lazy" alt={alt} />
    {caption && (
      <figcaption className="pr-block-image__caption">
        <RichText>{caption}</RichText>
      </figcaption>
    )}
  </figure>
);

export const ImageInContext = () => {
  const { config } = useBlock<ImageConfig>();
  return (
    <BaseBlock>
      <Image {...config} />
    </BaseBlock>
  );
};

export default ImageInContext;
