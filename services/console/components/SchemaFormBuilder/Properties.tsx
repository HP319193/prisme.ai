import { DeleteOutlined } from '@ant-design/icons';
import { Divider, Input, Schema, Tooltip } from '@prisme.ai/design-system';
import { Button, Collapse } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import SchemaFormBuilder from './SchemaFormBuilder';

interface PropertiesProps {
  value: Record<string, Schema>;
  onChange: (v: Record<string, Schema>) => void;
  addLabel?: string;
}

export const Properties = ({ value, onChange, addLabel }: PropertiesProps) => {
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

  return (
    <Collapse
      className="flex flex-1 flex-col pr-collapse-light"
      bordered={false}
    >
      {Object.entries(value || {}).map(([key, v], i) => (
        <Collapse.Panel
          key={i}
          className="flex flex-1 flex-col !p-4 -mx-[1rem]"
          header={
            <div
              className="relative flex flex-1"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.nodeName.toLowerCase() === 'label') return;
                e.stopPropagation();
              }}
            >
              <Input
                label={t('schema.property.name')}
                value={key}
                onChange={({ target: { value } }) => updateKey(key)(value)}
                pattern={/^[a-zA-Z0-9_]+$/.source}
                containerClassName="flex flex-1"
              />
              <div className="absolute -top-3 -right-2">
                <Tooltip title={t('schema.property.delete')} placement="left">
                  <Button onClick={remove(key)}>
                    <DeleteOutlined />
                  </Button>
                </Tooltip>
              </div>
            </div>
          }
        >
          <div className="flex flex-1 flex-col ml-7">
            <SchemaFormBuilder value={v} onChange={update(key)} />
            <Divider />
          </div>
        </Collapse.Panel>
      ))}
    </Collapse>
  );
};

export default Properties;
