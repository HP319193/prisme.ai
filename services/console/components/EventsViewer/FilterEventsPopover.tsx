import { Button, Popover } from '@prisme.ai/design-system';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import Form from '../SchemaForm/Form';

const FilterEvents = () => {
  const { t } = useTranslation('workspaces');
  const { updateFilters } = useWorkspace();

  return (
    <Form
      schema={{
        type: 'object',
        properties: {
          afterDate: {
            type: 'string',
            'ui:widget': 'datePicker',
          },
          beforeDate: {
            type: 'string',
            'ui:widget': 'datePicker',
          },
        },
      }}
      onSubmit={updateFilters}
    />
  );

  // return (
  //   <div className="flex grow flex-col justify-end items-end">
  //     <Input
  //       {...correlationIdInput}
  //       label={t('events.filters.correlationId')}
  //     />
  //     <Button type="submit" onClick={onSubmit}>
  //       {t('events.filters.submit')}
  //     </Button>
  //   </div>
  // );
};

const FilterEventsPopover = () => {
  const { t } = useTranslation('workspaces');

  return (
    <Popover content={() => <FilterEvents />} title={t('events.filters.title')}>
      <Button key="filter">
        <FilterOutlined />
        {t('events.filters.title')}
      </Button>
    </Popover>
  );
};

export default FilterEventsPopover;
