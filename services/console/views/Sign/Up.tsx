import { useCallback, useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Messages } from 'primereact/messages';
import { Form } from 'react-final-form';

import Field from '../../layouts/Field';
import Fieldset from '../../layouts/Fieldset';
import { useUser } from '../../components/UserProvider';
import { useRouter } from 'next/router';
import {
  Col,
  Input,
  Layout,
  Space,
  Title,
  Button,
} from '@prisme.ai/design-system';
import SignHeader from '../../components/SignHeader';

interface Values {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const SignIn = () => {
  const { t } = useTranslation('sign');
  const { push } = useRouter();
  const { user, loading, error, signup } = useUser();
  const messages = useRef<Messages>(null);

  const submit = useCallback(
    async ({ email, password, firstName, lastName }: Values) => {
      await signup(email, password, firstName, lastName);
    },
    [signup]
  );

  useEffect(() => {
    if (!messages.current || !error) return;

    messages.current.show({
      severity: 'error',
      summary: t('up.error', { context: error.error }),
    });
  }, [error, t]);

  useEffect(() => {
    if (!user || loading) return;
    push('/workspaces');
  }, [loading, push, user]);

  const validate = (values: Values) => {
    const errors: Partial<Values> = {};
    if (!values.email) {
      errors.email = 'required';
    }
    if (!values.password) {
      errors.password = 'required';
    }
    if (!values.firstName) {
      errors.firstName = 'required';
    }
    if (!values.lastName) {
      errors.lastName = 'required';
    }
    return errors;
  };

  const getIcon = () => {
    if (loading) return 'pi pi-spin pi-spinner';
    if (user) return 'pi pi-lock-open';
    return 'pi pi-lock';
  };

  return (
    <Layout Header={<SignHeader />} className="!bg-blue-200 pt-14">
      <div className="flex grow justify-evenly mt-32">
        <Col span={12}>
          <div className="flex items-center flex-col">
            <div>
              <Title>{t('up.header')}</Title>
              <Trans
                t={t}
                i18nKey="up.description"
                values={{
                  url: '/signin',
                }}
                components={{
                  a: <a href={`signin`} />,
                  icon: <i className="pi pi-copy" />,
                }}
              />
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className="flex items-center flex-col">
            <Form onSubmit={submit} validate={validate}>
              {({ handleSubmit }) => (
                <form onSubmit={handleSubmit} className="w-96 flex">
                  <Space
                    size="middle"
                    direction="vertical"
                    className="flex grow"
                  >
                    <Fieldset>
                      <Field name="email">
                        {({ input: { type, ...inputProps }, className }) => (
                          <Input
                            placeholder={t('in.email')}
                            className={`${className} h-12`}
                            {...inputProps}
                          />
                        )}
                      </Field>
                      <Field name="password">
                        {({ input: { type, ...inputProps }, className }) => (
                          <Input
                            placeholder={t('in.password')}
                            className={`${className} h-12`}
                            type={'password' as any}
                            {...inputProps}
                          />
                        )}
                      </Field>
                      <Field name="firstName">
                        {({ input: { type, ...inputProps }, className }) => (
                          <Input
                            placeholder={t('up.firstName')}
                            className={`${className} h-12`}
                            {...inputProps}
                          />
                        )}
                      </Field>
                      <Field name="lastName">
                        {({ input: { type, ...inputProps }, className }) => (
                          <Input
                            placeholder={t('up.lastName')}
                            className={`${className} h-12`}
                            {...inputProps}
                          />
                        )}
                      </Field>
                    </Fieldset>
                    <Button
                      variant="primary"
                      disabled={loading}
                      className="w-full !h-12"
                      type="submit"
                    >
                      <div className={`${getIcon()} mr-2`} />
                      {t('up.submit')}
                    </Button>
                  </Space>
                </form>
              )}
            </Form>
          </div>
        </Col>
      </div>
    </Layout>
  );
};

export default SignIn;
