import { Title } from '@prisme.ai/design-system';

interface BlockTitleProps {
  value: string;
}

const BlockTitle = ({ value }: BlockTitleProps) => {
  return <Title level={4}>{value}</Title>;
};

export default BlockTitle;
