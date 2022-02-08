import { useTranslation } from 'next-i18next';
import { FC, useMemo, useState } from 'react';
import { Form, useField } from 'react-final-form';
import FieldContainer from '../../../layouts/Field';
import Fieldset from '../../../layouts/Fieldset';
import { Chips } from 'primereact/chips';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';

const Endpoint = () => {
  const { t } = useTranslation('workspaces');
  const { input } = useField('endpoint');

  return (
    <div className="p-field mb-5">
      <label className="mx-2 flex flex-1 align--center flex-column">
        <InputSwitch
          checked={input.value !== false}
          onChange={({ value }) => input.onChange(value)}
          className="mr-2"
        />
        {t('automations.trigger.endpoint.custom')}
      </label>
      {input.value !== false && (
        <InputText
          {...input}
          value={typeof input.value === 'string' ? input.value : ''}
        />
      )}
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
    <div>
      <Form onSubmit={onSubmit} initialValues={initialValue}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Fieldset legend={t('automations.trigger.events.title')}>
              <FieldContainer name="events">
                {({ input }) => <Chips {...input} separator="," />}
              </FieldContainer>
            </Fieldset>
            <Fieldset legend={t('automations.trigger.dates.title')}>
              {t('automations.trigger.dates.help')}
            </Fieldset>
            <Fieldset legend={t('automations.trigger.endpoint.title')}>
              <Endpoint />
            </Fieldset>
            <Button>{t('automations.trigger.save')}</Button>
          </form>
        )}
      </Form>
    </div>
  );
};

export default TriggerForm;
