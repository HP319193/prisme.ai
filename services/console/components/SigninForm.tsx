import { Form } from 'react-final-form';
import { Button, Input, Space } from '@prisme.ai/design-system';
import Field from '../layouts/Field';
import { useCallback } from 'react';
import { useUser } from './UserProvider';
import { useTranslation } from 'next-i18next';

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
        <form onSubmit={handleSubmit} className="w-96 flex">
          <Space size="middle" direction="vertical" className="flex grow">
            <Field name="email">
              {({ input: { type, ...inputProps }, className }) => (
                <Input
                  placeholder={t('in.email')}
                  className={`${className} !h-12`}
                  {...inputProps}
                />
              )}
            </Field>
            <Field name="password">
              {({ input: { type, ...inputProps }, className }) => (
                <Input
                  placeholder={t('in.password')}
                  className={`${className} !h-12`}
                  inputType={'password' as any}
                  {...inputProps}
                />
              )}
            </Field>
            <Button
              variant="primary"
              disabled={loading}
              className="w-full !h-12"
              type="submit"
            >
              {t('in.submit')}
            </Button>
          </Space>
        </form>
      )}
    </Form>
  );
};
export default SigninForm;
