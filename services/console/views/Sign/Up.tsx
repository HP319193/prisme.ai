import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Messages } from 'primereact/messages';
import { Form } from 'react-final-form';

import FullScreen from '../../layouts/FullScreen';
import Field from '../../layouts/Field';
import Fieldset from '../../layouts/Fieldset';
import { useUser } from '../../components/UserProvider';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ApiError from '../../api/ApiError';

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
    <FullScreen>
      <Head>
        <title>{t('up.title')}</title>
        <meta name="description" content={t('up.description')} />
      </Head>
      <Form onSubmit={submit} validate={validate}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="w-8">
            <Fieldset legend={t('up.description')}>
              <Field name="email" label={t('up.email')}>
                {({ input, className }) => (
                  <InputText
                    id="email"
                    {...input}
                    autoFocus
                    className={`${className} min-w-full`}
                  />
                )}
              </Field>
              <Field name="password" label={t('up.password')}>
                {({ input, className }) => (
                  <InputText
                    id="password"
                    type="password"
                    {...input}
                    className={`${className} min-w-full`}
                  />
                )}
              </Field>
              <Field name="firstName" label={t('up.firstName')}>
                {({ input, className }) => (
                  <InputText
                    id="firstName"
                    {...input}
                    className={`${className} min-w-full`}
                  />
                )}
              </Field>
              <Field name="lastName" label={t('up.lastName')}>
                {({ input, className }) => (
                  <InputText
                    id="lastName"
                    {...input}
                    className={`${className} min-w-full`}
                  />
                )}
              </Field>
              <Field className="flex justify-content-between">
                <Link href="/signin">{t('up.signin')}</Link>
                <Button type="submit" disabled={loading}>
                  <div className={`${getIcon()} mr-2`} />
                  {t('up.submit')}
                </Button>
              </Field>
              <Messages ref={messages}></Messages>
            </Fieldset>
          </form>
        )}
      </Form>
    </FullScreen>
  );
};

export default SignIn;
