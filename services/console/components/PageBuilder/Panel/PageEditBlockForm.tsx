import { Schema } from '@prisme.ai/design-system';
import { useMemo } from 'react';
import Settings from './Settings';
import useLocalizedText from '../../../utils/useLocalizedText';
import { usePageBuilder } from '../context';
import PageBlockProvider from '../PageBlockProvider';
import useSchema, { EnhancedSchema } from '../../SchemaForm/useSchema';

interface PageEditBlockFormProps {
  blockId: string;
}

const PageEditBlockForm = ({ blockId }: PageEditBlockFormProps) => {
  const { localizeSchemaForm } = useLocalizedText();
  const { blocksInPage, removeBlock, page } = usePageBuilder();
  const { makeSchema } = useSchema();

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
    return makeSchema(localizeSchemaForm(schema), {
      'select:pageSections': (schema: EnhancedSchema) => {
        const sectionsIds = page.blocks.flatMap(
          ({ config: { sectionId } = {} }) => (sectionId ? sectionId : [])
        );
        if (sectionsIds.length === 0) return schema;

        schema['ui:widget'] = 'select';
        schema['ui:options'] = {
          select: {
            options: sectionsIds.flatMap((sectionId) => {
              return {
                label: sectionId,
                value: sectionId,
              };
            }),
          },
        };
        return schema;
      },
    });
  }, [editSchema, localizeSchemaForm, makeSchema, page]);

  return (
    <PageBlockProvider blockId={blockId}>
      <Settings schema={schema} removeBlock={() => removeBlock(blockId)} />
    </PageBlockProvider>
  );
};

export default PageEditBlockForm;
