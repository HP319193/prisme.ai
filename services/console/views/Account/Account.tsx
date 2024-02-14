import { useTranslation } from 'next-i18next';
import { useUser } from '../../components/UserProvider';
import React, { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { useForm } from 'react-final-form';
import { Button, Schema, SchemaForm } from '@prisme.ai/design-system';
import { ButtonProps } from '@prisme.ai/design-system/lib/Components/Button';
import SingleViewLayout from '../../components/Products/SingleViewLayout';

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
      className="self-center !h-auto font-bold py-[10px] px-[30px] mt-[50px] !text-[20px] !font-bold"
      {...props}
    />
  );
};

const Account = () => {
  const { t } = useTranslation('user');
  const { user, update } = useUser();
  const [updating, setUpdating] = useState(false);

  const schema = useMemo(
    () =>
      ({
        type: 'object',
        properties: {
          email: {
            type: 'string',
            title: t('edit.email.label'),
            disabled: true,
          },
          firstName: {
            type: 'string',
            title: t('edit.firstName.label'),
          },
          lastName: {
            type: 'string',
            title: t('edit.lastName.label'),
          },
          photo: {
            type: 'string',
            title: t('edit.photo.label'),
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

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{t('title.myAccount')}</title>
      </Head>
      <SingleViewLayout title={t('account_my')} backLink="/workspaces">
        <SchemaForm
          schema={schema}
          initialValues={user}
          buttons={[
            <SubmitButton key="submit" updating={updating}>
              {t('edit.submit')}
            </SubmitButton>,
          ]}
          onSubmit={submit}
          autoFocus
          locales={{
            uploadLabel: t('schemaForm.uploadLabel', { ns: 'common' }),
          }}
        />
      </SingleViewLayout>
    </>
  );
};

export default Account;
