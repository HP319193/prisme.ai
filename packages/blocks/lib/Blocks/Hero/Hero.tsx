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
}

interface HeroProps extends HeroConfig {}

export const Hero = ({
  className,
  title,
  lead,
  content,
  img,
  backgroundColor,
}: HeroProps) => {
  return (
    <div className={`pr-block-hero ${className}`} style={{ backgroundColor }}>
      <div className="pr-block-hero__container">
        <div className="pr-block-hero__text">
          <h1 className="pr-block-hero__title">{title}</h1>
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
