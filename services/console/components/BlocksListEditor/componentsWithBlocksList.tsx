import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { Modal } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';
import { Field } from 'react-final-form';
import { Block } from '../../providers/Block';
import AddBlock from './AddBlock';

import components from '../SchemaForm/schemaFormComponents';
import { SortableList, SortableListItem } from '../SortableList';
import BlockForm from './BlockForm';
import BlockPicker from './BlockPicker';
import { useBlocksListEditor } from './BlocksListEditorProvider';
import { useFieldArray } from 'react-final-form-arrays';
import { MenuOutlined } from '@ant-design/icons';

const BlocksList: FieldComponent = ({ name }) => {
  const { t } = useTranslation('workspaces');
  const { blocks } = useBlocksListEditor();
  const { fields } = useFieldArray(name);
  const [mounted, setMounted] = useState(true);

  const [displayBlocksSelection, setDisplayBlocksSelection] = useState(false);

  const [adding, setAdding] = useState<number | null>(null);
  const add = useCallback((index: number) => {
    setAdding(index);
    setDisplayBlocksSelection(true);
  }, []);
  const reallyAdd = useCallback(
    async (block: Block) => {
      if (adding === null) return;
      setMounted(false);
      await fields.insert(adding, { slug: block.slug });
      setMounted(true);
      setAdding(null);
      setDisplayBlocksSelection(false);
    },
    [adding, fields]
  );
  const removeBlock = useCallback(
    (block: Block) => async () => {
      setMounted(false);
      const pos = fields.value.indexOf(block);
      await fields.remove(pos);
      setMounted(true);
    },
    [fields]
  );
  const sort = useCallback(
    async (from: number, to: number) => {
      if (from === to) return;
      setMounted(false);
      await fields.move(from, to);
      setMounted(true);
    },
    [fields]
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
        <AddBlock onClick={() => add(0)}>
          {t('blocks.builder.add.label')}
        </AddBlock>
      </div>
      <SortableList onSort={sort}>
        {mounted &&
          fields.map((name, k) => (
            <Field name={name} key={name}>
              {({ input: { value, name: itemName } }) => (
                <SortableListItem id={`${k}`} item={value} key={itemName}>
                  {(provided) => (
                    <>
                      <div
                        className="my-4 p-2 border rounded flex flex-row items-start"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div {...provided.dragHandleProps}>
                          <MenuOutlined className="mt-[1.15rem] ml-2" />
                        </div>
                        <BlockForm
                          key={itemName}
                          name={itemName}
                          onRemove={removeBlock(value)}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex justify-center">
                        <AddBlock onClick={() => add(k + 1)}>
                          {t('blocks.builder.add.label')}
                        </AddBlock>
                      </div>
                    </>
                  )}
                </SortableListItem>
              )}
            </Field>
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
