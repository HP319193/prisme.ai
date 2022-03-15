# Workspaces

A workspace is a project that :  

* Enables various [**Automations**](automations) inside your IT organization, between your APIs, ...
* Is easily **configurable** through workspace [**config**](#config), [**Apps**](../apps) and automations **graph** 
* Produces [**events**](automations#events) recording what's happening and optionally triggering **Automations**  
* Present computed data / events through [**Web Pages**](#pages) accessible to admins or event external end users


## Config

For now, workspace config is only configurable from source code :  

```yaml
name: MyConfiguredWorkspace
config:
  value:
    API_URL: https://api.mycompany.com
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
[More details on variables usage](automations#variables).  

The **config** object accepts an additional field specific to apps : [**config.schema**](../apps#defining-an-app-config-schema)

## Pages

Pages allow you to build custom graphical interfaces using [**Widgets**](#widgets) provided by your workspace **and** its [AppInstances](../apps#appinstances) :  

![image](/assets/images/workspaces/page.png)  

At the right appears the list of available widgets separated by **AppInstance** : multiple instances of the same app will provide the same widgets, each of them consuming the data, endpoints & configuration from their respective instance.  

## Widgets
Widgets are the building blocks of **Pages**. They are web graphical components hosted anywhere on the web, which can then be integrated & configured inside a **Page**.  

In order to make a widget available to the page editor, it needs to be declared inside a **widgets** field at the root of the workspace source code :  

```yaml
widgets:
  editor:
    name: Editor
    url: https://cdn.company.com/public/someWidget/main.js
```

* The lowercased **editor** stands for the technical name that will be referenced inside your pages  
* The **name: Editor** stands for the human readable name showing up inside the page editor  
* **url** might references a **.js** entrypoint for the widget module, or any other URL that will be loaded inside an iframe.  

If **url** points to a **.js** file, this must be the entrypoint of a [BlockProtocol module](https://blockprotocol.org/).  
