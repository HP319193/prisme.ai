import { useExternalModule } from '@prisme.ai/blocks';
import { useEffect } from 'react';
import { usePageBuilder } from './context';
import externals from '../../utils/externals';
import { Schema } from '@prisme.ai/design-system';

interface ExternalSchemaLoaderProps extends Prismeai.Block {
  blockId: string;
}

export const ExternalSchemaLoader = ({
  blockId,
  url,
}: ExternalSchemaLoaderProps) => {
  const { setBlockSchema } = usePageBuilder();
  const { module, loading } = useExternalModule<{
    schema: Schema;
  }>({ url, externals });

  useEffect(() => {
    if (!module || loading) return;
    setBlockSchema(blockId, module.schema);
  }, [module, loading, setBlockSchema, blockId]);

  return null;
};

export default ExternalSchemaLoader;
