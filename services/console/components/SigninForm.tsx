import { Form } from 'react-final-form';
import { Button, Input, Title } from '@prisme.ai/design-system';
import Field from '../layouts/Field';
import { useCallback, useEffect, useState } from 'react';
import { useUser } from './UserProvider';
import { Trans, useTranslation } from 'next-i18next';
import LinkInTrans from './LinkInTrans';
import getConfig from 'next/config';
import Storage from '../utils/Storage';
import Link from 'next/link';
import MicrosoftIcon from '../icons/microsoft.svg';
import Image from 'next/image';

const {
  publicRuntimeConfig: {
    CONSOLE_URL = '',
    API_URL = '',
    ENABLED_AUTH_PROVIDERS = [],
  },
} = getConfig();

interface Values {
  email: string;
  password: string;
}

interface SigninFormProps {
  onSignin: (user: Prismeai.User | null) => void;
  show403?: false | string;
}

export const SigninForm = ({ show403 }: SigninFormProps) => {
  const { t } = useTranslation('sign');
  const { loading, signin, initAuthentication, completeAuthentication } =
    useUser();
  const [error, setError] = useState(false);
  const submit = useCallback(
    async ({ email, password }: Values) => {
      const success = await signin(email, password);
      setError(!success);
    },
    [signin]
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

  // 1. Init authentication flow
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const interactionUid = urlParams.get('interaction');
    const code = urlParams.get('code');
    if (!code && !interactionUid && !urlParams.get('error')) {
      if (!show403) {
        initAuthentication();
        return null;
      }
      return (
        <div className="flex flex-col items-center space-y-4 mb-16 mt-8">
          <Title className="text-center !text-3xl">{show403}</Title> <br />
          <div>
            <Button
              onClick={() => {
                initAuthentication();
              }}
              variant="primary"
              className="w-full !h-12 !mb-4 !font-bold"
            >
              {t('in.signin')}
            </Button>
          </div>
        </div>
      );
    } else if (code) {
      // Authorization code processing, wait for redirection
      return null;
    }
  }

  // 2. Display login form
  const microsoftAuthUrl =
    ENABLED_AUTH_PROVIDERS.includes('azure') && `${API_URL}/login/azure`;
  return (
    <Form onSubmit={submit} validate={validate}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className="md:w-96 flex">
          <div className="flex flex-col flex-1">
            {microsoftAuthUrl ? (
              <button
                className="w-full !h-12 !mb-4 !font-bold flex items-center text-[#3B3B3B] !border border-[#EDEDF0] rounded-[24px] text-center justify-center"
                type="button"
              >
                <Image
                  src={MicrosoftIcon}
                  width={16}
                  height={16}
                  alt="Microsoft"
                />
                <Link href={microsoftAuthUrl}>
                  <a className="font-bold ml-2">{t('in.withAzure')}</a>
                </Link>
              </button>
            ) : null}
            {microsoftAuthUrl ? (
              <div className='before:content-[""] before:h-[1px] before:bg-[#9F97AE] before:w-full before:block before:top-[50%] before:absolute relative text-center'>
                <span className="bg-white relative px-2 !font-bold text-[#9F97AE]">
                  {t('in.or')}
                </span>
              </div>
            ) : null}
            <Field
              name="email"
              containerClassName="!mx-0 !mb-4"
              initialValue={Storage.get('__email')}
            >
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
                components={{
                  a: (
                    <LinkInTrans
                      href={`${CONSOLE_URL}/forgot`}
                      className="text-link"
                    />
                  ),
                }}
              />
            </div>

            {error && (
              <div className="text-error mb-2">
                {t('in.error', { context: 'AuthenticationError' })}
              </div>
            )}
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
