import path from 'path';
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
// In development mode emails will not be send but previewed in your browser.
// If you want to really send the email you wil lhav to change process.env.NODE_ENV to "production"
export const emailSender = new Email({
  message: {
    from: EMAIL_FROM,
  },
  transport: initTransport(),
  i18n: {
    directory: path.join(__dirname, '../../locales'),
    defaultLocale: 'en',
    locales: ['en', 'fr', 'es'],
  },
});

export enum EmailTemplate {
  ForgotPassword = 'forgotPassword',
  ValidateAccount = 'validateAccount',
}

export type EmailTemplateVariables = {
  [EmailTemplate.ForgotPassword]: {
    locale: string;
    name: string;
    resetLink: string;
  };
  [EmailTemplate.ValidateAccount]: {
    locale: string;
    name: string;
    validateLink: string;
  };
};

export async function sendMail<t extends EmailTemplate>(
  template: t,
  variables: EmailTemplateVariables[t],
  email: string
) {
  return await emailSender.send({
    template: path.join(__dirname, `emails/${template}`),
    message: {
      to: email,
    },
    locals: variables,
  });
}
