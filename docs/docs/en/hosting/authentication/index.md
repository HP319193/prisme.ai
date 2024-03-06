# Authentication (SSO)

## Generic OIDC  

Prisme.ai is compatible with any OIDC provider like Google.  

**1. Register an app**  
First access your OIDC IdP back-office in order to register a **Web** OAuth2 client/app.  
Configure the following **authorized redirect URI** :  
```
https://api.studio.prisme.ai/v2/login/callback
```

Once created, note the following client informations :  

* Client ID  
* Client Secret  
* Auth URL : the `authorization_endpoint` triggering authentication flow  
* Token URL : the `token_endpoint` to exchange authorization codes with an authentication token  
* Certificate URL : the `jwks_uri` endpoint returning IdP public certificates  

`jwks_uri` might not be showed with client details as it is generally global to the IdP (or at least to the customer tenant, like Auth0).  
This URL can either return a [standard JWKS](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-set-properties) or an object mapping `kid`s to PEM certificate strings like [Google](https://www.googleapis.com/oauth2/v1/certs).  

!!! warning "Algorithm"

    For the moment, the only supported algorithm is **RS256**.

**2. Create & configure a `authProviders.config.yml` file**
```yaml
providers:
  <ProviderName>:
    type: oidc
    config:
      client_id: "your client id"
      client_secret: "your client secret"
      authorization_endpoint: "idp authorization_endpoint"
      token_endpoint: "idp token_endpoint"
      jwks_uri: "idp public certificates endpoint"
```

Although the choice is yours, name your **ProviderName** with care, as this name will be passed to front-end services & injected within [user authData](../workspaces/security.md#auth-data) (along with user claims), making it potentially difficult to change afterwards.   

You must replace `<ProviderName>` by the actual name of your provider.

An optional `config.scopes` field allow customizing requested scopes (& retrieved used claims by extension), which defaults to `openid email profile` and must at least include `openid` and `email`.  

```yaml hl_lines="10"
providers:
  myprovider:
    type: oidc
    config:
      client_id: "my_client_id"
      client_secret: "my_client_secret"
      authorization_endpoint: "https://authorization_endpoint"
      token_endpoint: "https://token_endpoint"
      jwks_uri: "https://public_certificates_endpoint"
      scopes: "openid email"
```

**3. Mount this configuration file to `prismeai-api-gateaway`**  
Mount this file as a volume inside `prismeai-api-gateway` container at `/www/services/api-gateway/authProviders.config.yml`  
You can customize this file location with `AUTH_PROVIDERS_CONFIG` environment variable  

**4. Enable the provider within console & pages**  
In order to display & customize sign in buttons connecting to our freshly configured OIDC provider, add the following environment variable to **prismeai-console** and **prismeai-pages** microservices :  

```
ENABLED_AUTH_PROVIDERS='[{"name": "local"}, {"name": "google", "label": "Google", "icon": "https://cdn.iconscout.com/icon/free/png-256/free-google-1772223-1507807.png"}]'
```

Configure `name`, `label` and `icon` with the desired provider name, its display label & icon url.  

If the `local` provider is omitted, the standard user / password sign in form will not appear.  
If you do not want the same IdP to be available between Prismai studio & workspaces pages, these 2 variables can also be differently configured between `prismeai-console` and `prismeai-pages`.  



## Configuring Microsoft SSO

**1. Register an app**  

First follow https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app in order to **register an app** in your Azure tenant.  

* The application can be named "Prisme.ai" or whatever else, it doesn't matter.  
* Select the desired **Supported account types** as it will restrict which microsoft accounts can log in the studio  
* Its redirect URI must be set to **Web** platform & have the following value :  https://api-gateway-url/v2/login/azure/callback  

**Note somewhere the application id** as it will be the client id passed in environment variables.  

**2. Generate a secret**  

Click on **Certificates & secrets** under **Manage** menu & add a **New client secret**.  

Keep longest expires time & **Add**.  
**Note somewhere the client secret value** as it will be the client secret passed in environement variables.  

**3. Configure environment variables**  

In order to finish SSO configuration in **api-gateway**, its following **environment variables** must be set :  

* **AZURE_AD_CLOUD_INSTANCE_ID** :  https://login.microsoftonline.com/ or any private one
* **AZURE_AD_TENANT** : The tenant domain as found in **Azure Active Directory** > **Primary domain** (ex: YourCompany.onmicrosoft.com)
    * In order to accept any organizational directory account, replace this value with **organizations**.
    * In order to accept any organizational directory and personal Microsoft accounts, replace this value with **common**.
    * In order to accept only Microsoft accounts only, replace this value with **consumers**.
    * This must reflect the **Supported account types** option chosen when registering the app 
* **AZURE_AD_APP_ID** : The application id retrieved in first step
* **AZURE_AD_CLIENT_SECRET** : The secret value retrieved in second step

Finally, add the following environment variable to **console** and **pages** microsevice :  

* **ENABLED_AUTH_PROVIDERS** : azure

or 

* **ENABLED_AUTH_PROVIDERS** :`[{"name":"custom","extends":"azure","label":{"fr":"Connexion avec custom","en":"Connect with custom"},"icon":"http://logo.png"}]`
