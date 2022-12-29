import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import useBlockComponent from '../../utils/useBlockComponent';
import { usePageBuilder } from './context';

interface BlockPreviewProps extends Prismeai.Block {
  slug: string;
  id: string;
}

export const BlockPreview = ({ id, slug, config }: BlockPreviewProps) => {
  const { block, loading } = useBlockComponent(slug);

  const { setBlockSchema } = usePageBuilder();
  const {
    i18n: { language },
  } = useTranslation();

  useEffect(() => {
    if (loading) return;
    setBlockSchema(id, block?.schema || null);
  }, [block, id, setBlockSchema, loading]);

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
