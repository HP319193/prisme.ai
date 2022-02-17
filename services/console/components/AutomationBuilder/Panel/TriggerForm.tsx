import { useTranslation } from 'next-i18next';
import { FC, useMemo } from 'react';
import { Form, useField } from 'react-final-form';
import FieldContainer from '../../../layouts/Field';
import Fieldset from '../../../layouts/Fieldset';
import { Button, Input, TagEditable } from '@prisme.ai/design-system';
import { Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const Endpoint = () => {
  const { t } = useTranslation('workspaces');
  const { input } = useField('endpoint');

  return (
    <div className="p-field mb-5">
      <label className=" flex flex-1 items-center justify-between flex-row">
        <div>{t('automations.trigger.endpoint.custom')}</div>

        {/*<Input*/}
        {/*  disabled={!input.value}*/}
        {/*  {...input}*/}
        {/*  label={t('automations.trigger.endpoint.url')}*/}
        {/*  value={typeof input.value === 'string' ? input.value : ''}*/}
        {/*/>*/}
        <Switch
          checked={input.value !== false}
          onChange={(value) => input.onChange(value)}
        />
      </label>
    </div>
  );
};

interface TriggerFormProps {
  trigger?: Prismeai.When;
  onSubmit: (v: Prismeai.When) => void;
}

export const TriggerForm: FC<TriggerFormProps> = ({ trigger, onSubmit }) => {
  const { t } = useTranslation('workspaces');
  const initialValue = useMemo(
    () => ({
      events: trigger?.events || [],
      endpoint: trigger?.endpoint ?? false,
    }),
    [trigger]
  );

  return (
    <div className="overflow-x-auto">
      <Form onSubmit={onSubmit} initialValues={initialValue}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Fieldset
              legend={t('automations.trigger.events.title')}
              hasDivider={false}
            >
              <FieldContainer name="events">
                {({ input }) => (
                  <TagEditable
                    placeholder={t('automations.trigger.events.title')}
                    {...input}
                  />
                )}
              </FieldContainer>
            </Fieldset>
            <Fieldset legend={t('automations.trigger.dates.title')}>
              {t('automations.trigger.dates.help')}
            </Fieldset>
            <Fieldset legend={t('automations.trigger.endpoint.title')}>
              <Endpoint />
            </Fieldset>
            <Button type="submit">
              <PlusOutlined />
              {t('automations.trigger.save')}
            </Button>
          </form>
        )}
      </Form>
    </div>
  );
};

export default TriggerForm;
