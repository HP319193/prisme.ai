import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from '@prisme.ai/design-system';
import { useUser } from './UserProvider';

interface ValidateFormProps {
  email: string;
  sent: boolean;
}

export const ValidateForm = ({
  email: defaultEmail = '',
  sent: alreadySent = false,
}: ValidateFormProps) => {
  const timerRef: { current: NodeJS.Timeout | void } = useRef();
  const [counter, setCounter] = useState(0);

  const {
    t,
    i18n: { language },
  } = useTranslation('sign');
  const { sendValidationMail, loading } = useUser();

  const enableButtonDelayed = useCallback(() => {
    setCounter(30); // We make a user wait 30s before being able to resend a validation email.
  }, []);

  useEffect(() => {
    if (alreadySent) {
      enableButtonDelayed();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enableButtonDelayed, alreadySent]);

  useEffect(() => {
    if (counter > 0) {
      timerRef.current = setTimeout(() => setCounter(counter - 1), 1000);
    }
  }, [counter]);

  const submit = useCallback(async () => {
    await sendValidationMail(defaultEmail, language);
    enableButtonDelayed();
  }, [language, defaultEmail, sendValidationMail, enableButtonDelayed]);

  return (
    <>
      <div className="md:w-96 flex flex-col items-center text-center">
        {t(`validate.emailSentAt`)}
      </div>
      <div className="font-bold md:w-96 flex flex-col items-center text-center">
        {defaultEmail}
      </div>
      <div className="md:w-96 flex flex-col items-center text-center mb-4">
        {t('validate.followInstructions')}
      </div>
      <Button
        variant="primary"
        disabled={loading || !!counter}
        className="md:w-96 flex !h-12 !mb-4"
        type="submit"
        onClick={submit}
      >
        {t('validate.submit')}
        {counter ? ` (${counter}s...)` : ''}
      </Button>
    </>
  );
};
export default ValidateForm;
