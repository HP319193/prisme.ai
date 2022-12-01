import { useCallback } from 'react';
import { Trans, useTranslation } from 'next-i18next';
import { Form } from 'react-final-form';
import { Button, Input } from '@prisme.ai/design-system';
import Field from '../layouts/Field';
import { OperationSuccess, useUser } from './UserProvider';
import LinkInTrans from './LinkInTrans';

interface Values {
  email: string;
  password: string;
}

interface ForgotFormProps {}

export const ForgotForm = ({}: ForgotFormProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('sign');
  const {
    sendPasswordResetMail,
    loading,
    success: { type: successType = '' } = {},
  } = useUser();

  const submit = useCallback(
    async ({ email }: Values) => {
      await sendPasswordResetMail(email, language);
    },
    [language, sendPasswordResetMail]
  );

  const validate = (values: Values) => {
    const errors: Partial<Values> = {};
    if (!values.email) {
      errors.email = 'required';
    }
    return errors;
  };

  return (
    <>
      <Form onSubmit={submit} validate={validate}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="md:w-96 flex">
            <div className="flex flex-col flex-1">
              <Field name="email" containerClassName="!mx-0 !mb-4">
                {({ input: { type, ...inputProps }, className }) => (
                  <Input
                    placeholder={t('forgot.email')}
                    className={`${className} !h-12`}
                    {...inputProps}
                  />
                )}
              </Field>
              <div className="!mx-0 !mb-8 text-right text-xs">
                <Trans
                  t={t}
                  i18nKey="forgot.signin"
                  values={{
                    url: '/signin',
                  }}
                  components={{
                    a: (
                      <LinkInTrans
                        className="text-xs text-link"
                        href={`signin`}
                      />
                    ),
                  }}
                />
              </div>
              <Button
                variant="primary"
                disabled={loading || successType === OperationSuccess.emailSent}
                className="w-full !h-12 !mb-4 !font-bold"
                type="submit"
              >
                {t('forgot.submit')}
              </Button>
            </div>
          </form>
        )}
      </Form>
      {successType === OperationSuccess.emailSent
        ? t('forgot.success', { context: successType })
        : null}
    </>
  );
};
export default ForgotForm;
