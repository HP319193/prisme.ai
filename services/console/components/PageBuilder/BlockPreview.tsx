import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import useBlockComponent from '../../utils/useBlockComponent';
import { usePageBuilder } from './context';

interface BlockPreviewProps extends Prismeai.Block {
  name: string;
  id: string;
}

export const BlockPreview = ({ id, name, config }: BlockPreviewProps) => {
  const { block } = useBlockComponent(name);
  const { setBlockSchema } = usePageBuilder();
  const {
    i18n: { language },
  } = useTranslation();

  useEffect(() => {
    if (block?.schema) {
      setBlockSchema(id, block.schema);
    }
  }, [block, id, setBlockSchema]);

  if (block?.Preview) {
    return (
      <div className="mt-4">
        <block.Preview config={config} language={language} />
      </div>
    );
  }

  return null;
};

export default BlockPreview;
