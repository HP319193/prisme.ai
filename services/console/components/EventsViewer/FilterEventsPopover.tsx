import { Button, Collapse, Popover, Tooltip } from '@prisme.ai/design-system';
import { FilterOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import Form from '../SchemaForm/Form';
import { useState } from 'react';
import { CodeEditorInline } from '../CodeEditor/lazy';

const QueryCollapse = ({ value, onChange }: any) => {
  const { t } = useTranslation('workspaces');

  const onCodeChange = (value: string) => {
    if (value === '') {
      onChange(value);
      return;
    }

    try {
      const parsedValue = JSON.parse(value);
      onChange(parsedValue);
      return;
    } catch (e) {}
  };

  return (
    <Collapse
      light
      className="flex-1"
      icon={() => (
        <Tooltip title={t('events.filters.query.description')}>
          <InfoCircleOutlined className="text-gray" />
        </Tooltip>
      )}
      items={[
        {
          label: t('events.filters.query.label'),
          content: (
            <CodeEditorInline
              mode="json"
              value={value}
              onChange={onCodeChange}
            />
          ),
        },
      ]}
    />
  );
};

interface FilterEventsProps {
  onSubmit: () => void;
}

const FilterEvents = ({ onSubmit }: FilterEventsProps) => {
  const { t } = useTranslation('workspaces');
  const { updateFilters } = useWorkspace();

  return (
    <div className="w-[60vw]">
      <Form
        schema={{
          type: 'object',
          properties: {
            afterDate: {
              title: t('events.filters.afterDate'),
              type: 'string',
              'ui:widget': 'datePicker',
            },
            beforeDate: {
              title: t('events.filters.beforeDate'),
              type: 'string',
              'ui:widget': 'datePicker',
            },
            text: {
              title: t('events.filters.text'),
              type: 'string',
            },
          },
          additionalProperties: {
            'ui:widget': QueryCollapse,
          },
          'ui:options': {
            layout: 'columns',
            lines: [
              ['afterDate', 'beforeDate'],
              ['text'],
              ['additionalProperties'],
            ],
          },
        }}
        onSubmit={(value) => {
          updateFilters(value);
          onSubmit();
        }}
        submitLabel={t('events.filters.submit')}
      />
    </div>
  );
};

const FilterEventsPopover = () => {
  const { t } = useTranslation('workspaces');
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <Popover
      onVisibleChange={() => setFilterVisible(!filterVisible)}
      content={() => <FilterEvents onSubmit={() => setFilterVisible(false)} />}
      title={t('events.filters.title')}
      visible={filterVisible}
      trigger="click"
    >
      <Button key="filter" onClick={() => setFilterVisible(true)}>
        <FilterOutlined />
        {t('events.filters.title')}
      </Button>
    </Popover>
  );
};

export default FilterEventsPopover;
