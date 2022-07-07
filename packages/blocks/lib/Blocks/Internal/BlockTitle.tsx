import { Title } from '@prisme.ai/design-system';

interface BlockTitleProps {
  value: string;
}

const BlockTitle = ({ value }: BlockTitleProps) => {
  return (
    <Title level={4} className="block-title">
      {value}
    </Title>
  );
};

export default BlockTitle;
