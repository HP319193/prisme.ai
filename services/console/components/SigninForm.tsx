import { Form } from 'react-final-form';
import { Button, Input } from '@prisme.ai/design-system';
import Field from '../layouts/Field';
import { useCallback } from 'react';
import { useUser } from './UserProvider';
import { Trans, useTranslation } from 'next-i18next';
import LinkInTrans from './LinkInTrans';

interface Values {
  email: string;
  password: string;
}

interface SigninFormProps {
  onSignin: (user: Prismeai.User | null) => void;
}

export const SigninForm = ({ onSignin }: SigninFormProps) => {
  const { t } = useTranslation('sign');
  const { loading, signin } = useUser();
  const submit = useCallback(
    async ({ email, password }: Values) => {
      const user = await signin(email, password);
      onSignin(user);
    },
    [onSignin, signin]
  );
  const validate = (values: Values) => {
    const errors: Partial<Values> = {};
    if (!values.email) {
      errors.email = 'required';
    }
    if (!values.password) {
      errors.password = 'required';
    }
    return errors;
  };
  return (
    <Form onSubmit={submit} validate={validate}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className="md:w-96 flex">
          <div className="flex flex-col flex-1">
            <Field name="email" containerClassName="!mx-0 !mb-4">
              {({ input: { type, ...inputProps }, className }) => (
                <Input
                  placeholder={t('in.email')}
                  className={`${className} !h-12`}
                  {...inputProps}
                />
              )}
            </Field>
            <Field name="password" containerClassName="!mx-0 !mb-2">
              {({ input: { type, ...inputProps }, className }) => (
                <Input
                  placeholder={t('in.password')}
                  className={`${className} !h-12`}
                  inputType={'password' as any}
                  {...inputProps}
                />
              )}
            </Field>
            <div className="!mx-0 !mb-8 text-right text-xs">
              <Trans
                t={t}
                i18nKey="in.forgot"
                values={{
                  url: '/forgot',
                }}
                components={{
                  a: <LinkInTrans href={`forgot`} className="text-link" />,
                }}
              />
            </div>
            <Button
              variant="primary"
              disabled={loading}
              className="w-full !h-12 !mb-4 !font-bold"
              type="submit"
            >
              {t('in.submit')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};
export default SigninForm;
