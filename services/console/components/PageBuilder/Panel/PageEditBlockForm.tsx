import { Schema } from '@prisme.ai/design-system';
import { useMemo } from 'react';
import Settings from './Settings';
import useLocalizedText from '../../../utils/useLocalizedText';
import { usePageBuilder } from '../context';
import getEditSchema from '../../PageBuilder/Panel/EditSchema/getEditSchema';

interface PageEditBlockFormProps {
  blockId: string;
}

const PageEditBlockForm = ({ blockId }: PageEditBlockFormProps) => {
  const { localizeSchemaForm } = useLocalizedText();
  const { blocksInPage, removeBlock } = usePageBuilder();

  const editedBlock = blocksInPage.find(({ key }) => key === blockId);
  const editSchema =
    editedBlock && (editedBlock.edit || getEditSchema(`${editedBlock.name}`));

  const schema: Schema | undefined = useMemo(() => {
    if (!editSchema) return;
    const schema = editSchema.type
      ? editSchema
      : ({
          type: 'object',
          properties: editSchema,
        } as Schema);
    return localizeSchemaForm(schema);
  }, [editSchema, localizeSchemaForm]);

  return (
    <Settings
      schema={schema}
      removeBlock={() => removeBlock(blockId)}
      blockId={blockId}
    />
  );
};

export default PageEditBlockForm;
