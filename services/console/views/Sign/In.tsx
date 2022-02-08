import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Messages } from 'primereact/messages';
import { Form } from 'react-final-form';

import { useUser } from '../../components/UserProvider';
import Image from 'next/Image';
import { useRouter } from 'next/router';
import {
  Input,
  Layout,
  Button,
  Title,
  Space,
  Col,
} from '@prisme.ai/design-system';
import icon from '../../icons/icon-prisme.svg';
import Fieldset from '../../layouts/Fieldset';
import Field from '../../layouts/Field';

interface Values {
  email: string;
  password: string;
}

export const SignIn = () => {
  const { t } = useTranslation('sign');
  const { push } = useRouter();
  const { user, loading, error, signin } = useUser();
  const messages = useRef<Messages>(null);

  const submit = useCallback(
    async ({ email, password }: Values) => {
      console.log('submitting');
      await signin(email, password);
    },
    [signin]
  );

  useEffect(() => {
    if (!messages.current || !error) return;

    messages.current.show({
      severity: 'error',
      summary: t('in.error', { context: error.error }),
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
    return errors;
  };

  const getIcon = () => {
    if (loading) return 'pi pi-spin pi-spinner';
    if (user) return 'pi pi-lock-open';
    return 'pi pi-lock';
  };

  return (
    <Layout
      Header={
        <div className="ml-24">
          <div className="flex flex-row">
            <Image src={icon} width={16} height={16} />
            Prisme.ai
          </div>
          <meta name="description" content={t('in.description')} />
        </div>
      }
      className="bg-blue-200 mt-14"
    >
      <div className="flex grow justify-evenly mt-32">
        <Col span={12}>
          <div className="flex items-center flex-col">
            <div>
              <Title>{t('login.header')}</Title>
              <div className="">{t('login.description')}</div>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className="flex items-center flex-col">
            <Form onSubmit={submit} validate={validate}>
              {({ handleSubmit }) => (
                <form onSubmit={handleSubmit} className="w-full">
                  <Space size="middle" direction="vertical">
                    <Fieldset legend={t('in.description')}>
                      <Field name="email">
                        {({ input: { type, ...inputProps }, className }) => (
                          <Input
                            placeholder={t('in.email')}
                            className={className}
                            {...inputProps}
                          />
                        )}
                      </Field>
                      <Field name="password">
                        {({ input: { type, ...inputProps }, className }) => (
                          <Input
                            placeholder={t('in.password')}
                            className={className}
                            type={'password' as any}
                            {...inputProps}
                          />
                        )}
                      </Field>
                    </Fieldset>
                    <Button
                      variant="primary"
                      disabled={loading}
                      className="w-full"
                      htmlType="submit"
                    >
                      {/* // TODO why submit doesn't work ?? */}
                      <div className={`${getIcon()} mr-2`} />
                      {t('in.submit')}
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

  // return (
  //   <>
  //
  //
  //           <Fieldset legend={t('in.description')}>
  //             <Field name="email" label={t('in.email')}>
  //               {({ input, className }) => (
  //                 <InputText
  //                   id="email"
  //                   {...input}
  //                   autoFocus
  //                   className={`${className} min-w-full`}
  //                 />
  //               )}
  //             </Field>
  //             <Field name="password" label={t('in.password')}>
  //               {({ input, className }) => (
  //                 <InputText
  //                   id="password"
  //                   type="password"
  //                   {...input}
  //                   className={`${className} min-w-full`}
  //                 />
  //               )}
  //             </Field>
  //             <Field className="flex justify-content-between">
  //               <div className="flex flex-column">
  //                 <Link href="/signup">{t('in.signup')}</Link>
  //               </div>
  //               <Button type="submit" disabled={loading}>
  //                 <div className={`${getIcon()} mr-2`} />
  //                 {t('in.submit')}
  //               </Button>
  //             </Field>
  //             <Messages className="absolute bottom-0" ref={messages}></Messages>
  //           </Fieldset>
  //         </form>
  //       )}
  //     </Form>
  //   </>
  // );
};

export default SignIn;
