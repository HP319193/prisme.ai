import { BlockComponent } from '../../BlockLoader';
import { useBlock } from '../../Provider';
import { useBlocks } from '../../Provider/blocksContext';
import tw from '../../tw';
import { BlocksList, BlocksListConfig } from '../BlocksList';

export interface HeroConfig {
  title: string;
  lead: string;
  content?: BlocksListConfig;
  img: string;
  backgroundColor: string;
}

export const Hero: BlockComponent<HeroConfig> = () => {
  const {
    config: { title, lead, content, img, backgroundColor },
  } = useBlock<HeroConfig>();
  const {
    utils: { BlockLoader },
  } = useBlocks();

  return (
    <div className="pr-block-hero" style={{ backgroundColor }}>
      <div
        className={tw`pr-block-hero__container flex flex-col p-4 justify-between sm:flex-row`}
      >
        <div className="pr-block-hero__text">
          <h1 className={tw`pr-block-hero__title text-5xl`}>{title}</h1>
          <p className={tw`pr-block-hero__lead mt-4`}>{lead}</p>
          {content && <BlocksList {...content} />}
        </div>
        {img && (
          <div className={tw`pr-block-hero__img max-w-sm w-full`}>
            <img src={img} role="img" alt="" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
