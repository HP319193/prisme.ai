import { FieldComponent } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { Modal, Dropdown, Menu } from 'antd';
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
import { MenuOutlined, MoreOutlined } from '@ant-design/icons';
import copy from '../../utils/Copy';

const BlocksList: FieldComponent = ({ name }) => {
  const { t } = useTranslation('workspaces');
  const { blocks } = useBlocksListEditor();
  const { fields } = useFieldArray(name);
  const [mounted, setMounted] = useState(true);

  const [displayBlocksSelection, setDisplayBlocksSelection] = useState(false);

  const [adding, setAdding] = useState<number | null>(null);
  const reallyAdd = useCallback(
    async (index: number, block: Block) => {
      setMounted(false);
      await fields.insert(index, block);
      setMounted(true);
      setAdding(null);
      setDisplayBlocksSelection(false);
    },
    [fields]
  );
  const add = useCallback(
    (index: number, block?: Block) => {
      if (block) {
        return setTimeout(() => reallyAdd(index, block));
      }
      setAdding(index);
      setDisplayBlocksSelection(true);
    },
    [reallyAdd]
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

  const getMenuItems = useCallback(
    (value: any) => [
      {
        key: 'copy',
        label: t('blocks.builder.copy.label'),
        onClick: () => {
          copy(value);
        },
      },
      {
        key: 'cut',
        label: t('blocks.builder.cut.label'),
        onClick: () => {
          copy(value);
          removeBlock(value)();
        },
      },
    ],
    [removeBlock, t]
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
        <BlockPicker
          blocks={blocks}
          onAdd={(block) => reallyAdd(adding as number, { slug: block.slug })}
        />
      </Modal>
      <div className="flex justify-center">
        <AddBlock onClick={(block) => add(0, block)}>
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
                        className="my-4 p-2 border rounded flex flex-row items-start relative"
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
                        <Dropdown
                          trigger={['click']}
                          overlay={
                            <Menu
                              onClick={(e) => e.domEvent.stopPropagation()}
                              items={getMenuItems(value)}
                            />
                          }
                        >
                          <MoreOutlined className="absolute right-1 mt-[1.25rem] ml-2" />
                        </Dropdown>
                      </div>
                      <div className="flex justify-center">
                        <AddBlock
                          onClick={(block) => {
                            add(k + 1, block);
                          }}
                        >
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
