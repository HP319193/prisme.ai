import { Button, Schema, SchemaForm } from '@prisme.ai/design-system';
import { ButtonProps } from '@prisme.ai/design-system/lib/Components/Button';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-final-form';
import { useUser } from '../../components/UserProvider';

const SubmitButton = ({
  updating,
  ...props
}: ButtonProps & { updating: boolean }) => {
  const { getState } = useForm();
  const { hasValidationErrors } = getState();

  return (
    <Button
      variant="primary"
      type="submit"
      disabled={hasValidationErrors || updating}
      className="self-center !h-auto font-bold py-[10px] px-[30px] mt-[50px] !font-bold"
      {...props}
    />
  );
};

export const UserForm = () => {
  const { t } = useTranslation('user');
  const { user, update } = useUser();
  const [updating, setUpdating] = useState(false);
  const schema = useMemo(
    () =>
      ({
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            title: t('account.settings.user.firstName.label'),
          },
          lastName: {
            type: 'string',
            title: t('account.settings.user.lastName.label'),
          },
          photo: {
            type: 'string',
            title: t('account.settings.user.photo.label'),
            'ui:widget': 'upload',
          },
        },
      } as Schema),
    [t]
  );

  const submit = useCallback(
    async ({ email, ...values }: any) => {
      if (user.photo && !values.photo) {
        values.photo = '';
      }
      if (user.photo === values.photo) {
        delete values.photo;
      }
      setUpdating(true);
      await update(values);
      setUpdating(false);
    },
    [update, user.photo]
  );
  return (
    <SchemaForm
      schema={schema}
      initialValues={user}
      buttons={[
        <SubmitButton key="submit" updating={updating}>
          {t('save', { ns: 'common' })}
        </SubmitButton>,
      ]}
      onSubmit={submit}
      autoFocus
      locales={{
        uploadLabel: t('schemaForm.uploadLabel', {
          ns: 'common',
        }),
      }}
    />
  );
};

export default UserForm;
