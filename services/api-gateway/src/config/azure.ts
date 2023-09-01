const msalCredentials = {
  cloudInstanceId: process.env.AZURE_AD_CLOUD_INSTANCE_ID,
  tenant: process.env.AZURE_AD_TENANT,
  clientId: process.env.AZURE_AD_APP_ID,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
};

export default {
  msal: {
    auth: {
      ...msalCredentials,
      authority:
        (msalCredentials.cloudInstanceId || '') +
        (msalCredentials.tenant || ''),
    },
  },
};
