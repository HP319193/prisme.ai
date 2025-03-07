import { Schema } from '@prisme.ai/design-system';
import { Block } from '../../providers/Block';
import SchemaForm from '../SchemaForm/SchemaForm';

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
        className="pr-block-list-editor"
      />
    </BlocksListEditorProvider>
  );
};

export default BlocksListEditor;
