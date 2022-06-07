import { Schema } from '@prisme.ai/design-system';
import { useMemo } from 'react';
import Settings from './Settings';
import useLocalizedTextConsole from '../../../utils/useLocalizedTextConsole';
import { usePageBuilder } from '../context';
import getEditSchema from '../../Blocks/EditSchema/getEditSchema';
import useBlockPageConfig from '../../PageBuilder/useBlockPageConfig';

interface PageEditBlockFormProps {
  blockId: string;
}

const PageEditBlockForm = ({ blockId }: PageEditBlockFormProps) => {
  const { localizeSchemaForm } = useLocalizedTextConsole();
  const { blocksInPage, removeBlock } = usePageBuilder();

  const { config, onConfigUpdate } = useBlockPageConfig({
    blockId,
  });

  const editedBlock = blocksInPage.find(({ key }) => key === blockId);
  const editSchema = editedBlock && getEditSchema(`${editedBlock.name}`);

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
    <Settings
      schema={schema}
      removeBlock={() => removeBlock(blockId)}
      config={config}
      onConfigUpdate={onConfigUpdate}
    />
  );
};

export default PageEditBlockForm;
