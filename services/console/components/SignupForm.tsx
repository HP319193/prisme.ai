import { Trans, useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';
import { Form } from 'react-final-form';
import { useUser } from './UserProvider';
import {
  Button,
  Checkbox,
  Input,
  notification,
  Space,
} from '@prisme.ai/design-system';
import Field from '../layouts/Field';
import { isFormFieldValid } from '../utils/forms';
import LinkInTrans from './LinkInTrans';
import { useRouter } from 'next/router';
import Storage from '../utils/Storage';

interface SignupFormProps {
  onSignup?: (user: Prismeai.User, next: () => void) => void;
  redirect?: string;
}

interface Values {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cgu: boolean;
}

export const SignupForm = ({
  onSignup,
  redirect = `https://${window.location.host}`,
}: SignupFormProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('sign');
  const { user, loading, error, signup } = useUser();

  const { push } = useRouter();

  useEffect(() => {
    if (!error) return;
    notification.error({
      message: t('up.error', { context: error.error }),
      placement: 'bottomRight',
    });
  }, [error, t]);

  useEffect(() => {
    if (!user || loading || user.authData?.anonymous) return;
    push('/');
  }, [loading, push, user]);

  const submit = useCallback(
    async ({ email, password, firstName, lastName }: Values) => {
      Storage.set('redirect-once-authenticated', redirect);
      const res = await signup(email, password, firstName, lastName, language);
      if (!res) return;
      const { validation, ...user } = res;
      function next() {
        if (validation === 'auto') {
          // User is auto validated, he can go to console home right now
          return;
        }
        if (validation === 'manual') {
          // User needs to wait for a super admin to validate its account.
          push(
            `/validate?${new URLSearchParams({
              email: email,
              manual: 'true',
            }).toString()}`
          );
          return;
        }
        // User must validate his account from its email.
        push(
          `/validate?${new URLSearchParams({
            email: email,
            sent: 'true',
          }).toString()}`
        );
      }
      if (onSignup) return onSignup(user, next);
      return next();
    },
    [redirect, signup, language, onSignup, push]
  );

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
    <Form onSubmit={submit} validate={validate}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className="w-96 flex">
          <Space size="middle" direction="vertical" className="flex flex-1">
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
            <Field name="email" initialValue={Storage.get('__email')}>
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
                            <LinkInTrans
                              href="https://www.prisme.ai/mentions-legales"
                              target="_blank"
                              rel="noreferrer"
                              className="text-link"
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
              className="w-full !h-12 !mb-4 !font-bold"
              type="submit"
            >
              {t('up.submit')}
            </Button>
          </Space>
        </form>
      )}
    </Form>
  );
};
export default SignupForm;
