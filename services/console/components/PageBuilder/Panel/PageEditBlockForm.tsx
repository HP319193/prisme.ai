import { Schema } from '@prisme.ai/design-system';
import { useMemo } from 'react';
import Settings from './Settings';
import useLocalizedTextConsole from '../../../utils/useLocalizedTextConsole';
import { usePageBuilder } from '../context';
import PageBlockProvider from '../PageBlockProvider';
import { useWorkspace } from '../../../layouts/WorkspaceLayout';

interface PageEditBlockFormProps {
  blockId: string;
}

const PageEditBlockForm = ({ blockId }: PageEditBlockFormProps) => {
  const { localizeSchemaForm } = useLocalizedTextConsole();
  const { blocksInPage, removeBlock } = usePageBuilder();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();

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

  // TODO test if entityId with empty string work here

  return (
    <PageBlockProvider
      blockId={blockId}
      workspaceId={workspaceId}
      entityId={''}
    >
      <Settings schema={schema} removeBlock={() => removeBlock(blockId)} />
    </PageBlockProvider>
  );
};

export default PageEditBlockForm;
