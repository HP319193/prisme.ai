import useBlockComponent from '../../utils/useBlockComponent';

interface BlockPreviewProps extends Prismeai.Block {
  name: string;
}

export const BlockPreview = ({ name, url = '' }: BlockPreviewProps) => {
  const { loading, block } = useBlockComponent(name);
  console.log(name, loading, block?.Preview);

  return null;
};

export default BlockPreview;
