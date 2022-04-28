import { useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form } from 'react-final-form';
import Field from '../../layouts/Field';
import { useUser } from '../../components/UserProvider';
import { useRouter } from 'next/router';
import {
  Button,
  Col,
  Input,
  Layout,
  notification,
  Space,
  Title,
} from '@prisme.ai/design-system';
import SignHeader from '../../components/SignHeader';
import icon from '../../icons/icon-prisme.svg';
import Image from 'next/image';

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

  const submit = useCallback(
    async ({ email, password, firstName, lastName }: Values) => {
      await signup(email, password, firstName, lastName);
    },
    [signup]
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

  return (
    <div className="flex grow flex-col-reverse md:flex-row overflow-y-auto">
      <div className="!flex flex-col bg-gradient-to-br from-[#0A1D3B] to-[#0F2A54] items-center justify-center md:w-[40vw]">
        <div className="hidden md:flex flex-col grow justify-center w-full space-y-4 lg:space-y-6">
          <div className="w-1/2 h-4 lg:h-8 bg-accent rounded-r-[100rem]" />
          <div className="w-1/2 h-4 lg:h-8 bg-pr-orange rounded-r-[100rem]" />
          <div className="w-1/2 h-4 lg:h-8 bg-pr-grey rounded-r-[100rem]" />
        </div>
        <div className="flex grow flex-col justify-end mb-10">
          <div className="flex items-center flex-col text-white p-[10%]">
            <div className="font-normal text-xl md:text-2xl xl:text-5xl leading-normal">
              <Trans
                t={t}
                i18nKey="in.header"
                components={{
                  b: <span className="font-bold" />,
                }}
              />

              <div className="flex flex-row  mt-20">
                <Image src={icon} width={16} height={16} alt="Prisme.ai" />
                <div className="ml-2 !font-light tracking-[.4em] text-sm">
                  PRISME.AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="!flex grow items-center justify-center md:w-[60vw] md:h-[100vh]">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center space-y-4 mb-16 mt-8">
            <div className="text-accent !font-light tracking-[.3em]">
              {t('up.topForm1')}
            </div>
            <Title className="text-center">{t('up.topForm2')}</Title>
            <div className="text-center">
              <Trans
                t={t}
                i18nKey="up.topForm3"
                values={{
                  url: '/signin',
                }}
                components={{
                  a: <a href={`signin`} />,
                }}
              />
            </div>
          </div>
          <Form onSubmit={submit} validate={validate}>
            {({ handleSubmit }) => (
              <form onSubmit={handleSubmit} className="w-96 flex">
                <Space size="middle" direction="vertical" className="flex grow">
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
                  <Button
                    variant="primary"
                    disabled={loading}
                    className="w-full !h-12"
                    type="submit"
                  >
                    {t('up.submit')}
                  </Button>
                </Space>
              </form>
            )}
          </Form>
        </div>
      </div>
    </div>
  );

  return (
    <Layout Header={<SignHeader />} className="!bg-blue-200 pt-14">
      <div className="flex grow justify-evenly mt-32">
        <Col span={12}>
          <div className="flex items-center flex-col">
            <div>
              <Title>{t('up.header')}</Title>
              <Trans
                t={t}
                i18nKey="up.description"
                values={{
                  url: '/signin',
                }}
                components={{
                  a: <a href={`signin`} />,
                }}
              />
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className="flex items-center flex-col">
            <Form onSubmit={submit} validate={validate}>
              {({ handleSubmit }) => (
                <form onSubmit={handleSubmit} className="w-96 flex">
                  <Space
                    size="middle"
                    direction="vertical"
                    className="flex grow"
                  >
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
                    <Button
                      variant="primary"
                      disabled={loading}
                      className="w-full !h-12"
                      type="submit"
                    >
                      {t('up.submit')}
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
};

export default SignIn;
