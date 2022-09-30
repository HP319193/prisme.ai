import { Title } from '@prisme.ai/design-system';
import tw from '../../tw';

interface BlockTitleProps {
  value: string;
}

const BlockTitle = ({ value }: BlockTitleProps) => {
  return (
    <div className={tw`block-cards__title-container title-container pt-4`}>
      <Title
        level={4}
        className={`block-title ${tw`!text-[1.333rem] !text-theme-text md:!text-[2.5rem]`}`}
      >
        {value}
      </Title>
    </div>
  );
};

export default BlockTitle;
