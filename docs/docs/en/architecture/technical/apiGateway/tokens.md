# Tokens  

The api-gateway service can issue signed JWTs in the two following scenarios :  

* **OpenID Connect (OIDC) authentication** : Once authenticating web clients (loaded from pages or console services) has received an authorization code from OIDC server (the **api gateway**), they exchange it with a **JWT**  
* **Anonymous authentication** : The `/v2/login/anonymous` initiates anonymous &unauthenticated sessions, receiving a userId, sessionId and a **JWT** in response

On the other hand,  authenticated users can also generate **accessTokens** (with `/v2/user/accessToken` APIs) to grant any script / technical account same privileges they have for a longer & predefined session duration. These **accessTokens** are opaque tokens generated with NodeJS `crypto.randomUUID()` method.  

## JWTs signing  

### Rotation

**api-gateway** signs JWT using a JWK automatically rotated & stored inside **api-gateway** database.  

When the currently active (i.e used for signing JWTs) JWK is rotated, it remains available for JWTs verification, but new session JWTs are signed using a new JWK.  

JWKs are removed **ACCESS_TOKENS_MAX_AGE** (max JWT expiration time) after their rotation, once all of their signed JWTs should have expired.  
On JWK rotation or removal, every **api-gateway** but also **runtime** instances are synchronized with updated JWK store through events (`gateway.jwks.updated` and `runtime.jwks.updated`).  
Indeed, **runtime** needs to be able to send requests on user behalf, and thus needs to receive new signing JWK whenever it is updated.  

However, this rotation only happens during **api-gateway** startup, so JWKs might not be rotated exactly on configured rotation period.  

**If the signing JWT has leaked, it must be manually deleted from database before restarting both api-gateway and runtime services.**  

Public keys are available at https://api.studio.prisme.ai/oidc/jwks

### Configuration

**api-gateway** supports the following environment variables for JWK & JWTs configuration :  

<table>
  <tr>
    <td>Environment variable</td>
    <td>Description</td>
    <td>Default value</td>
  </tr>

  <tr>
    <td>JWKS_ROTATION_DAYS</td>
    <td>Rotation period in days</td>
    <td>30</td>
  </tr>      
  <tr>
    <td>JWKS_KTY</td>
    <td>JWK Algorithm family, see <a href="https://github.com/cisco/node-jose">node-jose</a></td>
    <td>RSA</td>
  </tr>      
  <tr>
    <td>JWKS_ALG</td>
    <td>JWK signature algorithm, see <a href="https://github.com/cisco/node-jose">node-jose</a></td>
    <td>RS256</td>
  </tr>    
  <tr>
    <td>JWKS_SIZE</td>
    <td>JWK size, see <a href="https://github.com/cisco/node-jose">node-jose</a></td>
    <td>2048</td>
  </tr>      
  <tr>
    <td>ACCESS_TOKENS_MAX_AGE</td>
    <td>JWT expiration time in seconds</td>
    <td>2592000 (30 days)</td>
  </tr>      

</table>
