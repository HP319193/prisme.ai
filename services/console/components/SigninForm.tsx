import { Form } from 'react-final-form';
import { Button, Input, Title } from '@prisme.ai/design-system';
import Field from '../layouts/Field';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from './UserProvider';
import { Trans, useTranslation } from 'next-i18next';
import LinkInTrans from './LinkInTrans';
import getConfig from 'next/config';
import Storage from '../utils/Storage';
import Link from 'next/link';
import MicrosoftIcon from '../icons/microsoft.svg';
import useLocalizedText from '../utils/useLocalizedText';

interface AuthProvider {
  name: string;
  extends?: string;
  label?: Prismeai.LocalizedText;
  icon?: string;
  url?: string;
}

const {
  publicRuntimeConfig,
  publicRuntimeConfig: { CONSOLE_URL = '', API_URL = '' },
} = getConfig();

const ENABLED_AUTH_PROVIDERS: AuthProvider[] =
  publicRuntimeConfig.ENABLED_AUTH_PROVIDERS || [{ name: 'local' }];

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
  const { localize } = useLocalizedText();
  const { loading, signin, initAuthentication } = useUser();
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

  useEffect(() => {
    async function init() {
      const url = await initAuthentication();
      window.location.assign(url);
    }
    const urlParams = new URLSearchParams(window.location.search);
    const interactionUid = urlParams.get('interaction');
    const code = urlParams.get('code');
    if (!code && !interactionUid && !urlParams.get('error') && !show403) {
      init();
    }
  }, [initAuthentication, show403]);

  const oAuthButtons: {
    name: string;
    url?: string;
    label?: Prismeai.LocalizedText;
    icon?: string;
  }[] = useMemo(() => {
    function getProviderDetails(provider: string) {
      switch (provider) {
        case 'azure':
          return {
            url: `${API_URL}/login/azure`,
            icon: MicrosoftIcon,
            label: t('in.withAzure'),
          };
      }
      return null;
    }
    return ENABLED_AUTH_PROVIDERS.filter(({ name }) => name !== 'local').map(
      ({ name, extends: provider = name, ...rest }) => {
        const providerDetails = getProviderDetails(provider);
        const url =
          rest?.url && rest?.url.startsWith('/')
            ? `${API_URL}${rest?.url}`
            : rest?.url ||
              providerDetails?.url ||
              `${API_URL}/login/oauth?provider=${name}`;
        return {
          name,
          ...providerDetails,
          ...rest,
          url,
        };
      }
    );
  }, [t]);

  // 1. Init authentication flow
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const interactionUid = urlParams.get('interaction');
    const code = urlParams.get('code');
    if (!code && !interactionUid && !urlParams.get('error')) {
      if (!show403) {
        return null;
      }
      return (
        <div className="flex flex-col items-center space-y-4 mb-16 mt-8">
          <Title className="text-center !text-3xl">{show403}</Title> <br />
          <div>
            <Button
              onClick={async () => {
                const url = await initAuthentication();
                window.location.assign(url);
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

  const hasLocal = !!ENABLED_AUTH_PROVIDERS.find(
    ({ name }) => name === 'local'
  );
  const hasOAuthButtons = hasLocal && oAuthButtons.length > 0;

  return (
    <Form onSubmit={submit} validate={validate}>
      {({ handleSubmit }) => (
        <form
          onSubmit={handleSubmit}
          className="md:w-96 flex"
          data-testid="signin-form"
        >
          <div className="flex flex-col flex-1">
            {oAuthButtons.map(
              ({ icon, label, url }) =>
                url && (
                  <Link href={url}>
                    <a className="flex flex-1">
                      <Button
                        variant="primary"
                        type="button"
                        className="!flex flex-1 items-center justify-center"
                      >
                        {icon && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={icon}
                            width={16}
                            height={16}
                            alt="Microsoft"
                          />
                        )}

                        {label && (
                          <span className="font-bold ml-2">
                            {localize(label)}
                          </span>
                        )}
                      </Button>
                    </a>
                  </Link>
                )
            )}
            {hasOAuthButtons ? (
              <div className='before:content-[""] before:h-[1px] before:bg-[#9F97AE] before:w-full before:block before:top-[50%] before:absolute relative text-center my-4'>
                <span className="bg-white relative px-2 !font-bold text-[#9F97AE]">
                  {t('in.or')}
                </span>
              </div>
            ) : null}
            {hasLocal && (
              <>
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
                  className=" !font-bold"
                  type="submit"
                >
                  {t('in.submit')}
                </Button>
              </>
            )}
          </div>
        </form>
      )}
    </Form>
  );
};
export default SigninForm;
