import { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { Form } from 'react-final-form';
import { Button, Input } from '@prisme.ai/design-system';
import Field from '../layouts/Field';
import { OperationSuccess, useUser } from './UserProvider';

interface Values {
  password: string;
  confirm: string;
}

interface ForgotFormProps {
  token: string;
}

export const ResetForm = ({ token }: ForgotFormProps) => {
  const { t } = useTranslation('sign');
  const {
    passwordReset,
    loading,
    success: { type: successType = '' } = {},
  } = useUser();

  const submit = useCallback(
    async ({ password }: Values) => {
      await passwordReset(token, password);
    },
    [passwordReset, token]
  );

  const validate = (values: Values) => {
    const errors: Partial<Values> = {};
    if (!values.password) {
      errors.password = 'required';
    }
    if (!values.confirm) {
      errors.confirm = 'required';
    } else if (values.password !== values.confirm) {
      errors.confirm = 'must match';
    }
    return errors;
  };

  return (
    <>
      <Form onSubmit={submit} validate={validate}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="md:w-96 flex">
            <div className="flex flex-col flex-1">
              <Field name="password" containerClassName="!mx-0 !mb-4">
                {({ input: { type, ...inputProps }, className }) => (
                  <Input
                    placeholder={t('reset.password')}
                    className={`${className} !h-12`}
                    inputType={'password' as any}
                    {...inputProps}
                  />
                )}
              </Field>
              <Field name="confirm" containerClassName="!mx-0 !mb-8">
                {({ input: { type, ...inputProps }, className }) => (
                  <Input
                    placeholder={t('reset.confirm')}
                    className={`${className} !h-12`}
                    inputType={'password' as any}
                    {...inputProps}
                  />
                )}
              </Field>
              <Button
                variant="primary"
                disabled={
                  loading || successType === OperationSuccess.passwordReset
                }
                className="w-full !h-12 !mb-4 !font-bold"
                type="submit"
              >
                {t('reset.submit')}
              </Button>
            </div>
          </form>
        )}
      </Form>
      {successType === OperationSuccess.passwordReset
        ? t('forgot.success', { context: successType })
        : null}
    </>
  );
};
export default ResetForm;
