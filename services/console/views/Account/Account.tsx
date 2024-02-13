import { useTranslation } from 'next-i18next';
import Avatar from '../../icons/avatar.svgr';
import { useUser } from '../../components/UserProvider';
import React, { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import Title from '../../components/Products/Title';
import Link from 'next/link';
import AngleIcon from '../../icons/angle-down.svgr';
import Text from '../../components/Products/Text';
import { useForm } from 'react-final-form';
import { Button, Schema, SchemaForm } from '@prisme.ai/design-system';
import { ButtonProps } from '@prisme.ai/design-system/lib/Components/Button';

const SubmitButton = ({ ...props }: ButtonProps) => {
  const { getState } = useForm();
  const { hasValidationErrors } = getState();

  return (
    <Button
      variant="primary"
      type="submit"
      disabled={hasValidationErrors}
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
      setUpdating(true);
      await update(values);
      setUpdating(false);
    },
    [update]
  );

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{t('title.myAccount')}</title>
      </Head>
      <div className="bg-products-bg flex flex-col flex-1 p-[43px]">
        <Title className="flex flex-row mb-[27px] items-center">
          <Link href="/workspaces">
            <a>
              <button>
                <AngleIcon
                  className="rotate-90 mr-[12px]"
                  height={23}
                  width={23}
                />
              </button>
            </a>
          </Link>
          <Text className="flex pr-[205px] items-center text-[24px] font-semibold">
            {t('account_my')}
          </Text>
        </Title>
        <div className="bg-white rounded flex flex-col items-center justify-center flex-1">
          <style>{`
        .pr-form {
          display: flex;
          justify-content: center;
        }
        .pr-form * {
          font-size: 15px;
        }
        .pr-form-label {
          margin-bottom: 10px;
        }
        `}</style>
          <SchemaForm
            schema={schema}
            initialValues={user}
            buttons={[
              <SubmitButton key="submit">{t('edit.submit')}</SubmitButton>,
            ]}
            onSubmit={submit}
            autoFocus
            locales={{
              uploadLabel: t('schemaForm.uploadLabel', { ns: 'common' }),
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Account;
