import { useBlock } from '../../Provider';
import { useBlocks } from '../../Provider/blocksContext';
import useLocalizedText from '../../useLocalizedText';
import { BaseBlock } from '../BaseBlock';
import { BlocksListConfig } from '../BlocksList';
import { BaseBlockConfig } from '../types';

export interface HeroConfig extends BaseBlockConfig {
  title: Prismeai.LocalizedText;
  lead: Prismeai.LocalizedText;
  content?: BlocksListConfig;
  img: string;
  backgroundColor: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

interface HeroProps extends HeroConfig {}

export const Hero = ({
  className,
  title,
  lead,
  content,
  img,
  backgroundColor,
  level = 2,
}: HeroProps) => {
  const { localize } = useLocalizedText();
  const H = `h${level}` as keyof JSX.IntrinsicElements;
  const {
    utils: { BlockLoader },
  } = useBlocks();
  return (
    <div className={`pr-block-hero ${className}`} style={{ backgroundColor }}>
      <div className="pr-block-hero__container">
        <div className="pr-block-hero__text">
          <H className="pr-block-hero__title">{localize(title)}</H>
          {lead && <p className="pr-block-hero__lead">{localize(lead)}</p>}
          {content && <BlockLoader name="BlocksList" config={content} />}
        </div>
        {img && (
          <div className="pr-block-hero__img">
            <img src={img} role="img" alt="" />
          </div>
        )}
      </div>
    </div>
  );
};

const defaultStyles = `:block .pr-block-hero__container {
  display: flex;
  flex-direction: row;
  padding: 1rem;
  justify-content: space-between;

  max-width: 70%;
  margin: 0 auto;
  padding: 5rem 0;
  font-size: 1.6rem;
}
@media (max-width: 500px) {
  :block .pr-block-hero__container {
    flex-direction: column;
  }
}
:block .pr-block-hero__title {
  font-size: 3rem;
  font-weight: 700;
}
:block .pr-block-hero__lead {
  margin-top: 1rem;
}
:block .pr-block-hero__img {
  max-width: 24rem;
  width: 100%;
}
`;

export const HeroInContext = () => {
  const { config } = useBlock<HeroConfig>();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <Hero {...config} />
    </BaseBlock>
  );
};
HeroInContext.styles = defaultStyles;

export default HeroInContext;
