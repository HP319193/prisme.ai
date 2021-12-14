import { useCallback, useEffect, useRef } from "react";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { Form } from "react-final-form";

import FullScreen from "../../layouts/FullScreen";
import Field from "../../layouts/Field";
import Fieldset from "../../layouts/Fieldset";
import { useUser } from "../../components/UserProvider";
import { useRouter } from "next/router";

interface Values {
  email: string;
  password: string;
}
export const SignIn = () => {
  const { t } = useTranslation("sign");
  const { push } = useRouter();
  const { user, loading, error, signin } = useUser();
  const messages = useRef<Messages>(null);

  const submit = useCallback(
    async ({ email, password }: Values) => {
      await signin(email, password);
    },
    [signin]
  );

  useEffect(() => {
    if (!messages.current || !error) return;
    messages.current.show({
      severity: "error",
      summary: t("in.error", { context: error.code }),
    });
  }, [error, t]);

  useEffect(() => {
    if (!user || loading) return;
    push("/workspaces");
  }, [loading, push, user]);

  const validate = (values: Values) => {
    const errors: Partial<Values> = {};
    if (!values.email) {
      errors.email = "required";
    }
    if (!values.email) {
      errors.password = "required";
    }
    return errors;
  };

  const getIcon = () => {
    if (loading) return "pi pi-spin pi-spinner";
    if (user) return "pi pi-lock-open";
    return "pi pi-lock";
  };

  return (
    <FullScreen>
      <Head>
        <title>{t("in.title")}</title>
        <meta name="description" content={t("in.description")} />
      </Head>
      <Form onSubmit={submit} validate={validate}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="w-8">
            <Fieldset legend={t("in.description")}>
              <Field name="email" label={t("in.email")}>
                {({ input, className }) => (
                  <InputText
                    id="email"
                    {...input}
                    autoFocus
                    className={`${className} min-w-full`}
                  />
                )}
              </Field>
              <Field name="password" label={t("in.password")}>
                {({ input, className }) => (
                  <InputText
                    id="password"
                    type="password"
                    {...input}
                    className={`${className} min-w-full`}
                  />
                )}
              </Field>
              <Field className="flex justify-content-end">
                <Button type="submit" disabled={loading}>
                  <div className={`${getIcon()} mr-2`} />
                  {t("in.submit")}
                </Button>
              </Field>
              <Messages ref={messages}></Messages>
            </Fieldset>
          </form>
        )}
      </Form>
    </FullScreen>
  );
};

export default SignIn;
