import { Button, Popover } from '@prisme.ai/design-system';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import Form from '../SchemaForm/Form';
import { useState } from 'react';

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
            query: {
              type: 'object',
              title: t('events.filters.query.label'),
              description: t('events.filters.query.description'),
              additionalProperties: true,
              properties: {
                field: {
                  title: t('events.filters.query.field'),
                  type: 'string',
                },
                value: {
                  title: t('events.filters.query.value'),
                  type: 'string',
                },
              },
            },
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
