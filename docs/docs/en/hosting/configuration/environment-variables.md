# Environment variables reference  

**Note 1 :** Some variable default values might change depending on the selected start mode (Docker or Developer), especially URL-related ones  
**Note 2 :** Relative paths start from the executing service directory 

## Domains & URLs


<table>
  <tr>
    <td>Name</td>
    <td>Service</td>
    <td>Description</td>
    <td>Default value</td>
  </tr>


  <!-- Shared variables -->
  <tr>
    <td>GATEWAY_API_HOST</td>
    <td>api-gateway, workspaces, events</td>
    <td>api-gateway internal URL for internal requests (i.e contact fetching)</td>
    <td>http://localhost:3001/v2</td>
  </tr>          
  <tr>
    <td>API_URL</td>
    <td>console, pages, api-gateway, runtime</td>
    <td>api-gateway public URL</td>
    <td>http://studio.local.prisme.ai:3001/v2</td>
  </tr>  
   <tr>
    <td>CONSOLE_URL</td>
    <td>api-gateway, console, pages, runtime</td>
    <td>Studio URL, used for emails, auth redirections & runtime variable {{global.studioUrl}}</td>
    <td>http://studio.local.prisme.ai:3000</td>
  </tr>       
  <tr>
    <td>PAGES_HOST</td>
    <td>api-gateway, console, pages, runtime</td>
    <td>Pages base domain starting with a '.', workspace slug will be prefixed as a subdomain. Used for pages builder, pages sign in redirection from api gateway, & runtime variable {{global.pagesUrl}}</td>
    <td>.pages.local.prisme.ai:3100</td>  
  </tr>  
  

</table>

## Databases


**Notes on uploads bucket :**  
By default, S3 driver stores all uploads inside the same bucket whether they are public or private. This unique bucket is expected to allow public accesses and enable object level ACLs, letting the S3 driver selectively set objects public or private ACL.  

In case these S3 options are forbidden in your environment, you can have 2 separate S3 Buckets for public / private objects :  
* Both buckets can keep default S3 settings (which forbid any public access & disable object level ACLs)
* The 2nd additional bucket will be served through a public CDN allowed to access `*` objects (or any more restrictive patterns you want)  

In this setup, `UPLOADS_STORAGE_S3_*` environement variables will configure the private bucket, and the public bucket can be enabled with `UPLOADS_PUBLIC_STORAGE_S3_*` environment variables.  
Separate secret/access keys can be provided for the public bucket, or you can retrieve credentials from the first bucket by simply setting these 2 variables :  
```
UPLOADS_PUBLIC_STORAGE_S3_LIKE_BUCKET_NAME="here is your public uploads bucket name"
UPLOADS_PUBLIC_STORAGE_S3_LIKE_BASE_URL="here is your CDN public base URL"
```

<table>
  <tr>
    <td>Name</td>
    <td>Service</td>
    <td>Description</td>
    <td>Default value</td>
  </tr>

  <!-- Shared variables -->
  <tr>
    <td>BROKER_HOST</td>
    <td>All services</td>
    <td>Redis broker URL (must be the same across services)</td>
    <td>redis://localhost:6379/0</td>
  </tr>    
  <tr>
    <td>BROKER_PASSWORD</td>
    <td>All services</td>
    <td>Redis broker password</td>
    <td></td>
  </tr>      
  <tr>
    <td>BROKER_NAMESPACE</td>
    <td>All services</td>
    <td>Optional namespace to segment events in case the same database instance is shared by multiple platforms</td>
    <td></td>
  </tr>      
  <tr>
    <td>BROKER_TOPIC_MAXLEN</td>
    <td>All services</td>
    <td>Redis streams max length before getting truncated (See <a href="https://redis.io/topics/streams-intro#capped-streams">Capped Streams</a>)</td>
    <td>10000</td>
  </tr>      
  <tr>
    <td>BROKER_EMIT_MAXLEN</td>
    <td>All services</td>
    <td>Maximum size (in bytes) of emitted events</td>
    <td>100000</td>
  </tr>        

  <tr>
    <td>PERMISSIONS_STORAGE_HOST</td>
    <td>All services</td>
    <td>MongoDB URL for permissions storage (must be the same for both workspaces & events)</td>
    <td>mongodb://localhost:27017/permissions</td>
  </tr>         

  <!-- api-gateway -->
  <tr>
    <td>USERS_STORAGE_HOST</td>
    <td>api-gateway</td>
    <td>MongoDB URL for users storage</td>
    <td>mongodb://localhost:27017/users</td>
  </tr>       
  <tr>
    <td>SESSIONS_STORAGE_HOST</td>
    <td>api-gateway</td>
    <td>Redis URL for sessions storage</td>
    <td>redis://localhost:6379/0</td>
  </tr>         
  <tr>
    <td>SESSIONS_STORAGE_PASSWORD</td>
    <td>api-gateway</td>
    <td>Redis password for sessions storage</td>
    <td></td>
  </tr>   
  <tr>
    <td>CORS_ADDITIONAL_ALLOWED_ORIGINS</td>
    <td>api-gateway</td>
    <td>Allowed CORS origins. By default, only allowed origins are STUDIO_URL, PAGES_HOST or workspace configured custom domains</td>
    <td></td>
  </tr>   

  <!-- Events -->

  <tr>
    <td>EVENTS_STORAGE_ES_HOST</td>
    <td>events</td>
    <td>Elasticsearch URL for events persistance</td>
    <td>http://localhost:9200</td>
  </tr>       
  <tr>
    <td>EVENTS_STORAGE_ES_USER</td>
    <td>events</td>
    <td>Elasticsearch user for events persistance</td>
    <td></td>
  </tr>         
  <tr>
    <td>EVENTS_STORAGE_ES_PASSWORD</td>
    <td>events</td>
    <td>Elasticsearch password for events persistance</td>
    <td></td>
  </tr>      
  <tr>
    <td>EVENTS_TOPICS_CACHE_HOST</td>
    <td>events</td>
    <td>Redis URL for event userTopics persistance.</td>
    <td>BROKER_HOST variable</td>
  </tr>    
  <tr>
    <td>EVENTS_TOPICS_CACHE_PASSWORD</td>
    <td>events</td>
    <td>Redis password for event userTopics persistance.</td>
    <td></td>
  </tr>                      


  <!-- runtime & workspaces -->
  <tr>
    <td>WORKSPACES_STORAGE_TYPE</td>
    <td>runtime & workspaces</td>
    <td>Workspaces storage driver (FILESYSTEM | S3_LIKE | AZURE_BLOB). Must be the same instance for both runtime & workspaces.</td>
    <td>FILESYSTEM</td>
  </tr>     
  <tr>
    <td>WORKSPACES_STORAGE_FILESYSTEM_DIRPATH</td>
    <td>runtime & workspaces</td>
    <td>Workspaces filesystem storage : directory path</td>
    <td>../../data/models/</td>
  </tr>      
  <tr>
    <td>UPLOADS_STORAGE_FILESYSTEM_DIRPATH</td>
    <td>runtime & workspaces</td>
    <td>Uploads filesystem storage : directory path</td>
    <td>../../data/models/</td>
  </tr>         

  <tr>
    <td>WORKSPACES_STORAGE_S3_LIKE_ACCESS_KEY</td>
    <td>runtime & workspaces</td>
    <td>Workspaces s3 like storage : access key</td>
    <td></td>
  </tr>           
  <tr>
    <td>WORKSPACES_STORAGE_S3_LIKE_SECRET_KEY</td>
    <td>runtime & workspaces</td>
    <td>Workspaces s3 like storage : secret key</td>
    <td></td>
  </tr>     
  <tr>
    <td>WORKSPACES_STORAGE_S3_LIKE_BASE_URL</td>
    <td>runtime & workspaces</td>
    <td>Workspaces s3 like storage : base download url. If omitted, workspaces API will be used as  proxy</td>
    <td></td>
  </tr>       
  <tr>
    <td>WORKSPACES_STORAGE_S3_LIKE_ENDPOINT</td>
    <td>runtime & workspaces</td>
    <td>Workspaces s3 like storage : endpoint</td>
    <td></td>
  </tr>       
  <tr>
    <td>WORKSPACES_STORAGE_S3_LIKE_BUCKET_NAME</td>
    <td>runtime & workspaces</td>
    <td>Workspaces s3 like storage : bucket name</td>
    <td></td>
  </tr>       
  <tr>
    <td>WORKSPACES_STORAGE_S3_LIKE_REGION</td>
    <td>runtime & workspaces</td>
    <td>Workspaces s3 like storage : region</td>
    <td></td>
  </tr>                     

  <tr>
    <td>WORKSPACES_STORAGE_AZURE_BLOB_CONTAINER</td>
    <td>runtime & workspaces</td>
    <td>Workspaces Azure Blob container name</td>
    <td>models</td>
  </tr>         
  <tr>
    <td>WORKSPACES_STORAGE_AZURE_BLOB_CONNECTION_STRING</td>
    <td>runtime & workspaces</td>
    <td>Workspaces Azure Blob connection string</td>
    <td>models</td>
  </tr>           


  <!-- Runtime -->          
  <tr>
    <td>CONTEXTS_CACHE_HOST</td>
    <td>runtime</td>
    <td>Redis URL for contexts persistance.</td>
    <td>redis://localhost:6379/0</td>
  </tr>    
  <tr>
    <td>CONTEXTS_CACHE_PASSWORD</td>
    <td>runtime</td>
    <td>Redis password for contexts persistance.</td>
    <td></td>
  </tr>      

  <!-- Workspaces -->
  <tr>
    <td>UPLOADS_STORAGE_TYPE</td>
    <td>workspaces</td>
    <td>Uploads storage driver (FILESYSTEM | S3_LIKE | AZURE_BLOB). Must be the same instance for workspaces.</td>
    <td>FILESYSTEM</td>
  </tr>     
  <tr>
    <td>UPLOADS_STORAGE_FILESYSTEM_DIRPATH</td>
    <td>workspaces</td>
    <td>Uploads filesystem storage : directory path</td>
    <td>../../data/uploads</td>
  </tr>       
  <tr>
    <td>UPLOADS_STORAGE_S3_LIKE_ACCESS_KEY</td>
    <td>workspaces</td>
    <td>Uploads s3 like storage : access key</td>
    <td></td>
  </tr>           
  <tr>
    <td>UPLOADS_STORAGE_S3_LIKE_SECRET_KEY</td>
    <td>workspaces</td>
    <td>Uploads s3 like storage : secret key</td>
    <td></td>
  </tr>     
  <tr>
    <td>UPLOADS_STORAGE_S3_LIKE_BASE_URL</td>
    <td>workspaces</td>
    <td>Uploads s3 like storage : base url</td>
    <td></td>
  </tr>       
  <tr>
    <td>UPLOADS_STORAGE_S3_LIKE_ENDPOINT</td>
    <td>workspaces</td>
    <td>Uploads s3 like storage : endpoint</td>
    <td></td>
  </tr>       
  <tr>
    <td>UPLOADS_STORAGE_S3_LIKE_BUCKET_NAME</td>
    <td>workspaces</td>
    <td>Uploads s3 like storage : bucket name</td>
    <td></td>
  </tr>       
  <tr>
    <td>UPLOADS_STORAGE_S3_LIKE_REGION</td>
    <td>workspaces</td>
    <td>Uploads s3 like storage : region</td>
    <td></td>
  </tr>           
  <tr>
    <td>UPLOADS_FILESYSTEM_DOWNLOAD_URL</td>
    <td>workspaces</td>
    <td>Base download URL for files uploaded to filesystem driver</td>
    <td>Upload/Get request URL</td>
  </tr>             
  <tr>
    <td>UPLOADS_STORAGE_AZURE_BLOB_CONTAINER</td>
    <td>workspaces</td>
    <td>Uploads Azure Blob container name</td>
    <td>models</td>
  </tr>         
  <tr>
    <td>UPLOADS_STORAGE_AZURE_BLOB_CONNECTION_STRING</td>
    <td>workspaces</td>
    <td>Uploads Azure Blob connection string</td>
    <td></td>
  </tr>           
  <tr>
    <td>UPLOADS_STORAGE_AZURE_BLOB_BASE_URL</td>
    <td>workspaces</td>
    <td>Base public download url for uploads azure blob container : If omitted, workspaces API will be used as  proxy</td>
    <td></td>
  </tr>     


</table>  

## Other

<table>
  <tr>
    <td>Name</td>
    <td>Service</td>
    <td>Description</td>
    <td>Default value</td>
  </tr>

  <!-- Shared variables -->
  <tr>
    <td>OPENAPI_FILEPATH</td>
    <td>All services</td>
    <td>Requests & events validation swagger file path</td>
    <td>../specifications/swagger.yml</td>
  </tr>        

  <tr>
    <td>UPLOADS_MAX_SIZE</td>
    <td>workspaces,api-gateway,runtime</td>
    <td>Max upload size in bytes</td>
    <td>10000000 (10MB)</td>
  </tr>         


  <!-- OIDC -->
   <tr>
    <td>OIDC_PROVIDER_URL</td>
    <td>api-gateway, pages, console, runtime</td>
    <td>OIDC Authorization server URL. You don't need to define this OIDC variable if you intend to <a href="../../authentication/">add another provider</a></td>
    <td>API_URL env var, without any base path.</td>
  </tr>  
   <tr>
    <td>OIDC_STUDIO_CLIENT_ID</td>
    <td>api-gateway, console</td>
    <td>Studio OIDC client id</td>
    <td>local-client-id</td>
  </tr>         
   <tr>
    <td>OIDC_STUDIO_CLIENT_SECRET</td>
    <td>api-gateway</td>
    <td>Studio OIDC client secret, only known by api-gateway</td>
    <td>local-client-id</td>
  </tr>           
   <tr>
    <td>OIDC_CLIENT_REGISTRATION_TOKEN</td>
    <td>api-gateway</td>
    <td>Access token required for OIDC clients registration API</td>
    <td>local-client-id</td>
  </tr>             
  <tr>
    <td>OIDC_WELL_KNOWN_URL</td>
    <td>api-gateway</td>
    <td>OIDC provider configuration discovery URL (only if it's an external provider)</td>
    <td></td>
  </tr>    
  <tr>
    <td>SESSION_COOKIES_MAX_AGE</td>
    <td>api-gateway</td>
    <td>Auth server session cookies expiration (in seconds)</td>
    <td>2592000 (1 month)</td>
  </tr>    
  <tr>
    <td>ACCESS_TOKENS_MAX_AGE</td>
    <td>api-gateway</td>
    <td>Session expiration, used for both anonymous & authenticated sessions (in seconds)</td>
    <td>2592000 (1 month)</td>
  </tr>      
  <tr>
    <td>JWKS_URL</td>
    <td>api-gateway</td>
    <td>Defines the endpoint to call in order to retrieve the JWKS as part of our JWKS strategy.<br/>
    You might want to change this value using an internal api-gateway hostname if your are using our local provider (example: <code>http://api-gateway/oidc/jwks</code>).</td>
    <td>OIDC_PROVIDER_URL/oidc/jwks</td>
  </tr> 
  <tr>
    <td>SESSION_COOKIES_SIGN_SECRET</td>
    <td>api-gateway</td>
    <td>Session cookies signing secret</td>
    <td></td>
  </tr>   


  <!-- Console & Pages -->
  
  <tr>
    <td>WEBSOCKETS_DEFAULT_TRANSPORTS</td>
    <td>console,pages</td>
    <td><a href="https://socket.io/docs/v3/client-initialization/#transports">Default socketio transport method</a></td>
    <td>polling,websocket</td>
  </tr>  

  <!-- Console -->    
  <tr>
    <td>PORT</td>
    <td>console</td>
    <td>Listening port number</td>
    <td>3000</td>
  </tr>  

  <!-- api-gateway -->
  <tr>
    <td>PORT</td>
    <td>api-gateway</td>
    <td>Listening port number</td>
    <td>3001</td>
  </tr>    
  <tr>
    <td>GATEWAY_CONFIG_PATH</td>
    <td>api-gateway</td>
    <td>gateway.config.yml path</td>
    <td>../../gateway.config.yml</td>
  </tr>  
  <tr>
    <td>AUTH_PROVIDERS_CONFIG</td>
    <td>api-gateway</td>
    <td>authProviders.config.yml path</td>
    <td>../../authProviders.config.yml</td>
  </tr>    
  <tr>
    <td>INTERNAL_API_KEY</td>
    <td>api-gateway, workspaces</td>
    <td>API Key allowing internal services fetching events /sys/cleanup API</td>
    <td></td>
  </tr>       

  <tr>
    <td>PASSWORD_VALIDATION_REGEXP</td>
    <td>api-gateway</td>
    <td>Password validation regular expression</td>
    <td>.{8,32}</td>
  </tr>    
  <tr>
    <td>EMAIL_VALIDATION_ENABLED</td>
    <td>api-gateway</td>
    <td>Depreacted. Use ACCOUNT_VALIDATION_METHOD instead. Enable email validation on signup</td>
    <td>true</td>    
  </tr>
  <tr>
    <td>ACCOUNT_VALIDATION_METHOD</td>
    <td>api-gateway</td>
    <td>Account validation method on signup. Can be an auto validation ("auto"), a validation by email ("email") or a manual validation by a super admin ("manual")</td>
    <td>email</td>
  </tr>
  <tr>
    <td>WORKSPACES_API_URL</td>
    <td>api-gateway</td>
    <td>prismeai-workspaces internal URL</td>
    <td>http://workspaces:3002</td>
  </tr>      
  <tr>
    <td>EVENTS_API_URL</td>
    <td>api-gateway</td>
    <td>prismeai-events internal URL</td>
    <td>http://events:3004</td>
  </tr>      
  <tr>
    <td>RUNTIME_API_URL</td>
    <td>api-gateway</td>
    <td>prismeai-runtime internal URL</td>
    <td>http://runtime:3003</td>
  </tr>          
  <tr>
    <td>X_FORWARDED_HEADERS</td>
    <td>api-gateway</td>
    <td>Add X-Forwarded-* headers on proxied requests</td>
    <td>yes</td>
  </tr>
  <tr>
    <td>SUPER_ADMIN_EMAILS</td>
    <td>api-gateway</td>
    <td>List of users emails which should have access to every workspaces. Each email should be separated with a comma. Example: <code>john.doe@foo.com,admin@bar.ai</code></td>
    <td>None</td>
  </tr> 

  <!-- Events -->
  <tr>
    <td>PORT</td>
    <td>events</td>
    <td>Listening port number</td>
    <td>3004</td>
  </tr>      

  <tr>
    <td>EVENTS_BUFFER_FLUSH_AT</td>
    <td>events</td>
    <td>Persists events in the data lake each N events</td>
    <td>128</td>
  </tr>          
  <tr>
    <td>EVENTS_BUFFER_HIGH_WATERMARK</td>
    <td>events</td>
    <td>Stops listening for new events to be persisted when N events are already waiting to be persisted</td>
    <td>256</td>
  </tr>           
  <tr>
    <td>EVENTS_BUFFER_FLUSH_EVERY</td>
    <td>events</td>
    <td>
      Persists events every N milliseconds even if EVENTS_BUFFER_FLUSH_AT has not been reached
    </td>
    <td>5000</td>
  </tr>     
  <tr>
    <td>EVENTS_RETENTION_DAYS</td>
    <td>events</td>
    <td>
      Number of days events are kept inside the data lake before being removed
    </td>
    <td>180</td>
  </tr>       
  <tr>
    <td>EVENTS_CLEANUP_WORKSPACE_INACTIVITY_DAYS</td>
    <td>events</td>
    <td>
      Delete workspaces events if inactive for more than N days & with less than EVENTS_CLEANUP_WORKSPACE_MAX_EVENTS
    </td>
    <td>15</td>
  </tr>         
  <tr>
    <td>EVENTS_CLEANUP_WORKSPACE_MAX_EVENTS</td>
    <td>events</td>
    <td>
      Delete workspaces events if inactive for more than EVENTS_CLEANUP_WORKSPACE_INACTIVITY_DAYS & with less than N events
    </td>
    <td>100</td>
  </tr>         
  <tr>
    <td>EVENTS_SCHEDULED_DELETION_DAYS</td>
    <td>events</td>
    <td>
      Number of days events are kept inside the data lake after deleting their workspace
    </td>
    <td>90</td>
  </tr>           

  <tr>
    <td>SOCKETIO_COOKIE_MAX_AGE</td>
    <td>events</td>
    <td>Socket.io cookie maxAge</td>
    <td>Default value from 'cookie' NodeJS module</td>
  </tr>                  

  <tr>
    <td>EVENTS_STORAGE_ES_BULK_REFRESH</td>
    <td>events</td>
    <td>Enable Elastic "refresh" option when bulk inserting events (might induce overhead)</td>
    <td>no</td>
  </tr>                      

  <!-- runtime -->          
  <tr>
    <td>PORT</td>
    <td>runtime</td>
    <td>Listening port number</td>
    <td>3003</td>
  </tr>               
  <tr>
    <td>MAXIMUM_SUCCESSIVE_CALLS</td>
    <td>runtime</td>
    <td>Maximum number of automation execution for the same correlation id (i.e initiated by the same webhook or external event)</td>
    <td>20</td>
  </tr>          
  <tr>
    <td>CONTEXT_RUN_EXPIRE_TIME</td>
    <td>runtime</td>
    <td>Run context expiration time in seconds.</td>
    <td>60</td>
  </tr>       
  <tr>
    <td>CONTEXT_UNAUTHENTICATED_SESSION_EXPIRE_TIME</td>
    <td>runtime</td>
    <td>Session context expiration time in seconds for unauthenticated sessions</td>
    <td>60*60 (1 hour)</td>
  </tr>       

  <tr>
    <td>ADDITIONAL_GLOBAL_VARS_*</td>
    <td>runtime</td>
    <td>Additional variables that will be available from global context (ADDITIONAL_GLOBAL_VARS_apiUrl will be available as {{global.apiUrl}}).</td>
    <td>None</td>
  </tr> 

  <tr>
    <td>WORKSPACE_CONFIG_{{workspaceSlug}}_{{variableName}} </td>
    <td>runtime</td>
    <td>Additional variables that will be available for a specific workspace. (<code>WORKSPACE_CONFIG_knowledge-manager_secretApiKey</code> will be available at <code>{{config.secretApiKey}}</code> within the automations of the knowledge-manager workspace).</td>
    <td>None</td>
  </tr> 

  <tr>
    <td>APP_CONFIG_{{appSlug}}_{{variableName}} </td>
    <td>runtime</td>
    <td>Additional variables that will be available for a specific app. 
    (<code>APP_CONFIG_MailSender_mailApiKey</code> will be available as <code>{{config.mailApiKey}}</code> within the automations of an instance of the MailSender app). Useful if you want to publish your app without compromising a secret.</td>
    <td>None</td>
  </tr> 

         

  <!-- Workspaces -->          
  <tr>
    <td>PORT</td>
    <td>workspaces</td>
    <td>Listening port number</td>
    <td>3002</td>
  </tr>

  <tr>
    <td>UPLOADS_ALLOWED_MIMETYPES</td>
    <td>workspaces</td>
    <td>Allowed upload MIME types, comma-separated</td>
    <td>image/*,text/*,video/*,audio/*,application/*</td>
  </tr>             
  <tr>
    <td>UPLOADS_FORBIDDEN_MIMETYPES</td>
    <td>workspaces</td>
    <td>Forbidden upload MIME types, comma-separated (do not support wildcards)</td>
    <td></td>
  </tr>               
  <tr>
    <td>UPLOADS_DEFAULT_VISIBILITY</td>
    <td>workspaces</td>
    <td>If not explicitly set in API request, default uploads visibility</td>
    <td>public</td>
  </tr>               
        
</table>
