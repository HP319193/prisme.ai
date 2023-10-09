# Apps

An **App** is simply a [**Workspace**](..) which has been **published** as an **App** reusable in every other workspace.  

Once installed in a workspace, this app behaves like any normal workspace, [except for a few differences](#appinstances-execution). 

## Publishing an app

When a workspace is deemed ready to be published, this can be done from the drop-down menu at the top of your **Workspace**.  

A workspace cannot be published to more than 1 distinct app. On the first time it is published, an input will prompt you the name of the published app.  
After that, every future publish will reuse this name. Thus, an app name currently cannot be changed afterwards.  

If the source workspace defines **description** or **photo** fields, they will be reused as the app description and photo.  

### Defining an App Config schema  

In order to ease the configuration of your app, it is possible to specify a **config.schema** field inside your source workspace. This schema follows the same notation as for [**Automations arguments**](../automations#arguments) :   
```yaml
config:
  schema:
    someRawJSON:
      type: object
      additionalProperties: true
    API_URL:
      type: string
    nestedObject:
      type: object
      properties:
        fieldA:
          type: string 
        fieldB:
          type: number 
```

Thus, when installing the app, a configuration form will be automatically generated :  
![image](/assets/images/apps/configschema.png)  


### App versioning

Every time a workspace is published, its current state is copied over an immutable & new version of the target app.  

By default, when installing an app inside a workspace, it automatically receives updated versions. However, we can lock an installed app to a specific version from the workspace source code :  

```yaml
imports:
  Custom Code:
    appSlug: Custom Code
    appVersion: "5"
    config:
      ...
```

AppInstances versioning UI is not available yet.  



## Installing an app  

Installing an app creates an **AppInstance** inside the workspace, allowing multiples instances of the same app to coexist each one with their own configuration.  

Thus, each **AppInstance** is strictly isolated from each other to avoid conflicts with parent workspaces & AppInstances.  

## AppInstances execution

As described above, during execution, AppInstances' automations are isolated from parent Workspace (including its others AppInstances).  

This has a few consequences :   

## Private automations  
For security reasons, some apps might have internal automations which must not be called from parent workspace. To protect these automations, a `private: true` option can be set, as follows :  

```yaml
  privateAutomation:
    name: privateAutomation
    private: true
    output: '{{output}}'
    do:
      - ...

```

This way, only automations from current app will be able to call **privateAutomation**.  

### Config variable

In the context of an AppInstance, the [**config**](../automations#contexts) variable will hold current AppInstance config only. In case some config fields are left undefined, they will retrieve the value from the source App config as a default value.  

**An AppInstance automation cannot access parent workspace's configuration or automations**.  

As for workspaces, sensitive app config values like credentials can be passed from environment variables built using the target app slug, for example :  
```
APP_CONFIG_openai_API_KEY=https://api.mycompany.com
```
This will set a variable `config.API_KEY` inside `openai` AppInstances.  
AppInstances configuration (i.e as seen in studio) takes precedence over environment variables.  


### Run context
An automation might know it is running in the context of an AppInstance thanks to the **run** context.  

[More details on **run** context](../automations#run).

### Emit instruction

[Emit](../instructions/#emit) instruction will prefix given event name with a name uniquely identifying current AppInstance inside the parent workspace.  

For instance, if an emit instruction tries to emit "**executed**" event in the context of an AppInstance named "**toolbox**", the actual name of the emitted event will be "**toolbox.executed**".  

Workspace admins will view this full name inside their events feed, but from the AppInstance standpoint it will stay an **executed** event.  


### Event Triggers

As a consequence of the above, **event triggers** will always prefix listened events with this same name uniquely identifying current AppInstance.  

If we have an automation listening to this **executed** events inside **toolbox** AppInstance, the actual name of the listened event will be "**toolbox.executed**".  

If parent workspace wants to listen to this AppInstance event, it must also have an event trigger on "**toolbox.executed**". It could also trigger the AppInstance automations by emitting "**toolbox.executed**".  

**On the contrary, this makes impossible for the AppInstance to listen to any events from parent workspace.**  

#### Available native events  

Only [**native events**](../automations/#supported-native-events) available to AppInstances are the following ones :  

* **workspaces.apps.installed** : current AppInstance has just been installed
* **workspaces.apps.uninstalled** : current AppInstance has been uninstalled
* **workspaces.apps.configured** : current AppInstance configuration has been updated  
* **apps.published** : current **OR** parent workspace is published  
* **apps.deleted** : current **OR** parent workspace is "unpublished"  

### Endpoint Triggers

As for **events**, AppInstance **endpoints** are namespaced as well.  
Given a **functions** AppInstance with an **execute** automation enabling an endpoint trigger, the actual endpoint name will **functions.execute** instead of **execute** as it would be inside the source app workspace.  


## Nested apps

Since an app is initially a workspace and workspaces can install apps, **apps can be nested**.  

For example, let's say we're building a **Chatbot** workspace.  
We will first need to install a **NLU** app.  
However, as this **NLU** app was initially built using another **FrenchEmbeddings** app, our **Chatbot** workspace ends up executing nested apps :  

**Chatbot** <-> **nlu** <-> **french**

In this scenario, every isolation mechanism described above still applies :  

* **Chatbot** can call both **nlu** and **french** automations and listen to their events. However, the full **french** prefix will be **nlu.french**. So, **Chatbot** might be able to listen to a **nlu.french.processed** event  
* **nlu** can call **french** automations / events with **french** prefix  (i.e **french.processed** event)
* **french** cannot access anything from **Chatbot** nor **nlu**

