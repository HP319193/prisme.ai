import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { Modal } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';
import { useField } from 'react-final-form';
import { Block } from '../../providers/Block';

import components from '../SchemaForm/schemaFormComponents';
import { SortableList, SortableListItem } from '../SortableList';
import BlockForm from './BlockForm';
import BlockPicker from './BlockPicker';
import { useBlocksListEditor } from './BlocksListEditorProvider';

const BlocksList: FieldComponent = ({ name }) => {
  const { t } = useTranslation('workspaces');
  const { blocks } = useBlocksListEditor();
  const {
    input: { value, onChange },
  } = useField<Block[]>(name);

  const [displayBlocksSelection, setDisplayBlocksSelection] = useState(false);

  const [adding, setAdding] = useState<number | null>(null);
  const add = useCallback((index: number) => {
    setAdding(index);
    setDisplayBlocksSelection(true);
  }, []);
  const reallyAdd = useCallback(
    (block: Block) => {
      if (adding === null) return;
      const newValue = [...value];
      newValue.splice(adding, 0, { slug: block.slug });
      onChange(newValue);
      setAdding(null);
      setDisplayBlocksSelection(false);
    },
    [adding, onChange, value]
  );
  const removeBlock = useCallback(
    (block: Block) => () => {
      const newValue = value.filter((item) => item !== block);
      onChange(newValue);
    },
    [onChange, value]
  );
  const sort = useCallback(
    (from: number, to: number) => {
      const item = value[from];
      if (!item) return;
      const newValue = value.filter((i) => i !== item);
      newValue.splice(to, 0, item);
      onChange(newValue);
    },
    [onChange, value]
  );

  return (
    <div className="flex flex-col py-4 px-8 rounded bg-[rgb(0,0,0,.01)]">
      <style>{`.ant-collapse { background: transparent; }`}</style>
      <Modal
        open={displayBlocksSelection}
        footer={null}
        onCancel={() => setDisplayBlocksSelection(false)}
        title={t('blocks.builder.picker.title')}
        width="100%"
      >
        <BlockPicker blocks={blocks} onAdd={reallyAdd} />
      </Modal>
      <div className="flex justify-center">
        <button
          type="button"
          className="ant-btn ant-btn-primary flex flex-row"
          onClick={() => add(0)}
        >
          {t('blocks.builder.add.label')}
        </button>
      </div>
      <SortableList onSort={sort}>
        {(Array.isArray(value) ? value : []).map((block, k) => (
          <SortableListItem key={k} id={`${k}`} item={block}>
            <div className="my-4 p-2 border rounded">
              <BlockForm name={`${name}[${k}]`} onRemove={removeBlock(block)} />
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                className="ant-btn ant-btn-primary flex flex-row"
                onClick={() => add(k + 1)}
              >
                {t('blocks.builder.add.label')}
              </button>
            </div>
          </SortableListItem>
        ))}
      </SortableList>
    </div>
  );
};

export const componentsWithBlocksList = {
  ...components,
  UiWidgets: { ...components.UiWidgets, BlocksList },
};

export default componentsWithBlocksList;
