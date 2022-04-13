# Workspaces

## Definitions

A workspace is a project that :  

* Enables various [**Automations**](automations) inside your IT organization, between your APIs, ...
* Is easily **configurable** through workspace [**config**](#config), [**Apps**](apps) and automations **graph** 
* Produces [**events**](automations#events) recording what's happening and optionally triggering **Automations**  
* Present computed data / events through [**Web Pages**](pages) accessible to admins or event external end users


## Config

For now, workspace config is only configurable from source code :  

```yaml
name: MyConfiguredWorkspace
config:
  value:
    API_URL: https://api.mycompany.com
    LOGIN_URL: "{{config.API_URL}}/login"
    headers:
      apiKey: someAPIKey

automations:
  fetchMyAPI:
    ...
    do:
      - fetch:
          url: '{{config.API_URL}}'
          headers: '{{config.headers}}'
```  

The **config.value** field defined at the top of this workspace is exposed as a **config** variable inside your automations.  
This **config** variable is also avaible in the workspace config itself, as well as in installed apps config.  
[More details on variables usage](automations#variables).  

The **config** object accepts an additional field specific to apps : [**config.schema**](apps#defining-an-app-config-schema)
