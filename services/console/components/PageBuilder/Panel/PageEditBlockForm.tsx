import { Schema } from '@prisme.ai/design-system';
import { useMemo } from 'react';
import Settings from './Settings';
import useLocalizedTextConsole from '../../../utils/useLocalizedTextConsole';
import { usePageBuilder } from '../context';
import { useWorkspace } from '../../../layouts/WorkspaceLayout';
import getEditSchema from '../../Blocks/EditSchema/getEditSchema';
import useBlockConfig from '../useBlockConfig';

interface PageEditBlockFormProps {
  blockId: string;
}

const PageEditBlockForm = ({ blockId }: PageEditBlockFormProps) => {
  const { localizeSchemaForm } = useLocalizedTextConsole();
  const { blocksInPage, removeBlock } = usePageBuilder();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();

  const { config, onConfigUpdate } = useBlockConfig({ blockId, workspaceId });

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
