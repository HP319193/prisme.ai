const CONSOLE_URL = process.env.CONSOLE_URL || 'https://studio.prisme.ai';

export default {
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || 'mg.prisme.ai',
  MAILGUN_HOST: process.env.MAILGUN_HOST || 'api.eu.mailgun.net',
  EMAIL_FROM: process.env.EMAIL_FROM || '"Prisme.ai" <no-reply@prisme.ai>',
  CONSOLE_URL,
  RESET_PASSWORD_URL: process.env.RESET_PASSWORD_URL || `${CONSOLE_URL}/forgot`,
  LOGIN_URL: process.env.LOGIN_URL || `${CONSOLE_URL}/signin`,
  ACCOUNT_VALIDATION_METHOD:
    process.env.ACCOUNT_VALIDATION_METHOD ||
    // retro compatibility
    (process.env.EMAIL_VALIDATION_ENABLED &&
      (['true', '1'].includes(process.env.EMAIL_VALIDATION_ENABLED || 'true')
        ? 'email'
        : 'auto')) ||
    'email',
};
