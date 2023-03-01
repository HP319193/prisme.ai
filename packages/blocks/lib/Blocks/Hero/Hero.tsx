import { useBlock } from '../../Provider';
import { BaseBlock } from '../BaseBlock';
import { BlocksList, BlocksListConfig } from '../BlocksList';
import { BaseBlockConfig } from '../types';

export interface HeroConfig extends BaseBlockConfig {
  title: string;
  lead: string;
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
  const H = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <div className={`pr-block-hero ${className}`} style={{ backgroundColor }}>
      <div className="pr-block-hero__container">
        <div className="pr-block-hero__text">
          <H className="pr-block-hero__title">{title}</H>
          <p className="pr-block-hero__lead">{lead}</p>
          {content && <BlocksList {...content} />}
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
}
@media (max-width: 500px) {
  :block .pr-block-hero__container {
    flex-direction: column;
  }
}
:block .pr-block-hero__title {
  font-size: 3rem;
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
