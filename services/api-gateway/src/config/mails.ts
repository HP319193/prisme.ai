export default {
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || 'mg.prisme.ai',
  MAILGUN_HOST: process.env.MAILGUN_HOST || 'api.eu.mailgun.net',
  EMAIL_FROM: process.env.EMAIL_FROM || '"Prisme.ai" <no-reply@prisme.ai>',
  RESET_PASSWORD_URL:
    process.env.RESET_PASSWORD_URL || 'https://studio.prisme.ai/forgot', // How can we manage this env variable better ?
};
