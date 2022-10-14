import { useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form } from 'react-final-form';
import Field from '../../layouts/Field';
import { useUser } from '../../components/UserProvider';
import { useRouter } from 'next/router';

import { isFormFieldValid } from '../../utils/forms';
import {
  Button,
  Checkbox,
  Input,
  notification,
  Space,
} from '@prisme.ai/design-system';
import { SignLayout, SignType } from '../../components/SignLayout';

interface Values {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cgu: boolean;
}

export const SignIn = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('sign');
  const { push } = useRouter();
  const { user, loading, error, signup } = useUser();

  const submit = useCallback(
    async ({ email, password, firstName, lastName }: Values) => {
      await signup(email, password, firstName, lastName, language);
    },
    [signup, language]
  );

  useEffect(() => {
    if (!error) return;
    notification.error({
      message: t('up.error', { context: error.error }),
      placement: 'bottomRight',
    });
  }, [error, t]);

  useEffect(() => {
    if (!user || loading) return;
    push('/workspaces');
  }, [loading, push, user]);

  const validate = (values: Values) => {
    const errors: Partial<Record<keyof Values, string>> = {};
    if (!values.cgu) {
      errors.cgu = 'required';
    }
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

  return (
    <SignLayout type={SignType.Up} link="signin">
      <Form onSubmit={submit} validate={validate}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="w-96 flex">
            <Space size="middle" direction="vertical" className="flex grow">
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
              <Field name="email">
                {({ input: { type, ...inputProps }, className }) => (
                  <Input
                    placeholder={t('up.email')}
                    className={`${className} h-12`}
                    {...inputProps}
                  />
                )}
              </Field>
              <Field name="password">
                {({ input: { type, ...inputProps }, className }) => (
                  <Input
                    placeholder={t('up.password')}
                    className={`${className} h-12`}
                    inputType={'password' as any}
                    {...inputProps}
                  />
                )}
              </Field>
              <Field name="cgu" className="text-xs">
                {({ input, meta }) => (
                  <div>
                    <Checkbox
                      checked={input.value}
                      onChange={({ target: { checked } }) =>
                        input.onChange(checked)
                      }
                    >
                      <span
                        className={isFormFieldValid(meta) ? 'text-error' : ''}
                      >
                        <Trans
                          t={t}
                          i18nKey="up.cgu"
                          components={{
                            a: (
                              <a
                                href="https://www.prisme.ai/mentions-legales"
                                target="_blank"
                                rel="noreferrer"
                              />
                            ),
                          }}
                        />
                      </span>
                    </Checkbox>
                  </div>
                )}
              </Field>
              <Button
                variant="primary"
                disabled={loading}
                className="w-full !h-12 !mb-4"
                type="submit"
              >
                {t('up.submit')}
              </Button>
            </Space>
          </form>
        )}
      </Form>
    </SignLayout>
  );
};

export default SignIn;
