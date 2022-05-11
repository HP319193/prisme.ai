import { Schema } from '@prisme.ai/design-system';
import { useMemo } from 'react';
import Settings from './Settings';
import useLocalizedText from '../../../utils/useLocalizedText';
import { usePageBuilder } from '../context';
import PageBlockProvider from '../PageBlockProvider';

interface PageEditBlockFormProps {
  blockId: string;
}

const PageEditBlockForm = ({ blockId }: PageEditBlockFormProps) => {
  const { localizeSchemaForm } = useLocalizedText();
  const { blocksInPage, removeBlock } = usePageBuilder();

  const editedBlock = blocksInPage.find(({ key }) => key === blockId);
  const editSchema = editedBlock && (editedBlock.edit as Schema['properties']);

  const schema: Schema | undefined = useMemo(() => {
    if (!editSchema) return;
    const schema: Schema = editSchema.type
      ? editSchema
      : {
          type: 'object',
          properties: editSchema,
        };
    return localizeSchemaForm(schema);
  }, [editSchema, localizeSchemaForm]);

  return (
    <PageBlockProvider blockId={blockId}>
      <Settings schema={schema} removeBlock={() => removeBlock(blockId)} />
    </PageBlockProvider>
  );
};

export default PageEditBlockForm;
