import { Schema } from '@prisme.ai/design-system';
import { useMemo } from 'react';
import Settings from './Settings';
import useLocalizedText from '../../../utils/useLocalizedText';
import { usePageBuilder } from '../context';
import getEditSchema from '../../PageBuilder/Panel/EditSchema/getEditSchema';
import useBlocks from '../useBlocks';

interface PageEditBlockFormProps {
  blockId: string;
}

const PageEditBlockForm = ({ blockId }: PageEditBlockFormProps) => {
  const { localizeSchemaForm } = useLocalizedText();
  const { value, removeBlock } = usePageBuilder();
  const { available } = useBlocks();
  const { slug } = value.get(blockId) || {};

  const editedBlock = available.find(({ slug: s }) => s === slug);

  const editSchema =
    editedBlock && (editedBlock.edit || getEditSchema(`${editedBlock.slug}`));

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
