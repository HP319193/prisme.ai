import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Input,
  Divider,
  Tooltip,
  Collapse,
  Schema,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import SchemaFormBuilder from './SchemaFormBuilder';

export const Properties = ({ value, onChange }: any) => {
  const { t } = useTranslation('workspaces');
  const update = useCallback(
    (updatedKey: keyof typeof value) => (schema: Schema) => {
      onChange(
        Object.keys(value).reduce(
          (prev, key) => ({
            ...prev,
            [key]: key === updatedKey ? schema : value[key],
          }),
          {}
        )
      );
    },
    [onChange, value]
  );

  const updateKey = useCallback(
    (prevKey: keyof typeof value) => (newKey: string) => {
      onChange(
        Object.keys(value).reduce((prev, key) => {
          return {
            ...prev,
            [prevKey === key ? newKey : key]: value[key],
          };
        }, {})
      );
    },
    [onChange, value]
  );

  const add = useCallback(() => {
    onChange({ ...value, '': { type: 'string' } });
  }, [onChange, value]);

  const remove = useCallback(
    (oldKey: string) => () => {
      onChange(
        Object.keys(value).reduce(
          (prev, key) =>
            key === oldKey ? prev : { ...prev, [key]: value[key] },
          {}
        )
      );
    },
    [onChange, value]
  );

  const items = useMemo(
    () =>
      Object.keys(value || {}).map((key) => ({
        label: (
          <div
            className="relative flex flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              label={t('schema.property.name')}
              value={key}
              onChange={({ target: { value } }) => updateKey(key)(value)}
              pattern={/^[a-zA-Z0-9_]+$/.source}
              containerClassName="flex flex-1"
            />
            <Tooltip title={t('schema.property.delete')} placement="left">
              <button
                type="button"
                onClick={remove(key)}
                className="absolute top-[30px] right-3"
              >
                <DeleteOutlined />
              </button>
            </Tooltip>
          </div>
        ),
        content: (
          <div>
            <div className="pl-4 border-l-[1px] border-x-gray-200">
              <SchemaFormBuilder value={value[key]} onChange={update(key)} />
            </div>
            <Divider />
          </div>
        ),
      })),
    [remove, t, update, updateKey, value]
  );

  return (
    <div className="flex flex-1 flex-col mt-[1rem] centered-collapse">
      <Collapse items={items} expandIconPosition="left" />
      <Button onClick={add}>{t('schema.property.add')}</Button>
    </div>
  );
};

export default Properties;
