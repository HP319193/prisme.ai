import nodemailer from 'nodemailer';
import mailgunTransport from 'nodemailer-mailgun-transport';
import Email from 'email-templates';
import { mails as config } from '../config';

const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_HOST, EMAIL_FROM } = config;

// Configure transport
const initTransport = () => {
  try {
    return nodemailer.createTransport(
      mailgunTransport({
        auth: {
          api_key: MAILGUN_API_KEY,
          domain: MAILGUN_DOMAIN,
        },
        host: MAILGUN_HOST,
      })
    );
  } catch (error) {
    console.error('Failed to instanciate mailgun transport, aborting.', error);
    return;
  }
};

// Prepare email-templates sender instance with default options
export const emailSender = new Email({
  message: {
    from: EMAIL_FROM,
  },
  transport: initTransport(),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'es'],
  },
});
