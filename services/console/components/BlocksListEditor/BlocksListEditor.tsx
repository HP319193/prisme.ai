import { Schema, SchemaForm } from '@prisme.ai/design-system';
import { Block } from '../../providers/Block';

import BlocksListEditorProvider from './BlocksListEditorProvider';
import componentsWithBlocksList from './componentsWithBlocksList';

const schema: Schema = {
  type: 'object',
  properties: {
    blocks: {
      'ui:widget': 'BlocksList',
    },
  },
};

interface BlocksListEditorProps {
  value: Block;
  onChange?: (b: Prismeai.Block) => void;
}

export const BlocksListEditor = ({
  value,
  onChange,
}: BlocksListEditorProps) => {
  return (
    <BlocksListEditorProvider>
      <SchemaForm
        schema={schema}
        initialValues={value}
        components={componentsWithBlocksList}
        onChange={onChange}
        buttons={[]}
      />
    </BlocksListEditorProvider>
  );
};

export default BlocksListEditor;
