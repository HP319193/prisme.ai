import { Button, Input, Popover } from '@prisme.ai/design-system';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import { Form, useField } from 'react-final-form';

interface FilterEventsProps {
  onSubmit: () => void;
}

const FilterEvents = ({ onSubmit }: FilterEventsProps) => {
  const { t } = useTranslation('workspaces');
  const { input: correlationIdInput } = useField('correlationId');

  return (
    <div className="flex grow flex-col justify-end items-end">
      <Input
        {...correlationIdInput}
        label={t('events.filters.correlationId')}
      />
      <Button type="submit" onClick={onSubmit}>
        {t('events.filters.submit')}
      </Button>
    </div>
  );
};

const FilterEventsPopover = () => {
  const { t } = useTranslation('workspaces');
  const { filters, updateFilters } = useWorkspace();

  return (
    <Form onSubmit={updateFilters} initialValues={{ ...filters }}>
      {({ handleSubmit }) => (
        <Popover
          content={() => <FilterEvents onSubmit={handleSubmit} />}
          title={t('events.filters.title')}
        >
          <Button key="filter">
            <FilterOutlined />
            {t('events.filters.title')}
          </Button>
        </Popover>
      )}
    </Form>
  );
};

export default FilterEventsPopover;
