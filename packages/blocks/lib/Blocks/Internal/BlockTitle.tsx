import { Title } from '@prisme.ai/design-system';
import tw from '../../tw';

interface BlockTitleProps {
  value: string;
}

const BlockTitle = ({ value }: BlockTitleProps) => {
  return (
    <div className={tw`block-cards__title-container title-container pt-8`}>
      <Title
        level={4}
        className={`block-title ${tw`!text-[2.5rem] !text-theme-text`}`}
      >
        {value}
      </Title>
    </div>
  );
};

export default BlockTitle;
