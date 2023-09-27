# Automations

## Definitions

In simple words, **automations** describes **what to do** and **when**.  
The **what** is described as a sequence of **instructions**, and the **when** is defined with **triggers**.

**Example :**  

A _HubspotDealsOnSlack_ automation might send a notification message on Slack every time a new Hubspot deal is created by sales teams.  
Technically, the **what** would be a **fetch** instruction calling Slack API to send a message.  
On the other side, the **when**  would be an **URL** (i.e webhook) trigger that Hubspot will call everytime a new deal is opened.  


## Triggers  

Inside the automation graph, the triggers can be configured with the very first block at the screen top.  

### URL  
When an automation activates its **URL** trigger, it becomes publicly available through an URL which you can copy from your Workspace graph or source code. At this point, you might paste the URL inside whatever external service (i.e Hubspot) configuration with webhooks capabilities.  

From inside the automation defining an **URL** triger, 4 [variables](#variables) give access to input HTTP requests :  

* **body**  
* **headers**  
* **method**  
* **query**  

### Events  
An automation can also listen to a list of events.  
Whenever such events are received, the automation is executed & can access event payload with **payload** variable, and event source (source IP, correlationId, userId, automation, ...) with **source** variable.  

These events can be :  

* [**Native events**](#supported-native-events)  
* [**Emitted**](../instructions#emit) from the same workspace
* **Emitted** from an [**AppInstance**](../apps#emit-instruction)

### Schedules
An automation can be regularly triggered, based on a list of cron **schedules**.  
An automation can be schedule **at most** every 15 minutes.    

Here is a valid example of schedule :   
```yaml
when:
  schedules:
    - '* * * * *'
```  
*As stated before, this example will be triggered every 15 minutes even if it describes a cron that should be executed "at every minute".*

Whenever an automation is successfully planned a `runtime.automations.scheduled` event is emitted within the workspace, you can observe it on the workspace's Activity Feed.    

The automation will be scheduled "on the hour", that means if you schedule it to repeat every 20 minutes at 3:14, the job will first run at 3:20, then 3:40, and so on.     

Also, when you schedule your automation keep in mind that it will be executed based on the **UTC timezone**.  
The following schedule : `0 5 * * *` means it will be run every day at 5:00 UTC.

If you need help creating your cron, here is a little [tool](https://crontab.guru/) that can help writing one. 

Here is a video walkthrough about scheduling:
<a href="https://www.loom.com/share/860571466810477996287c9f61a63eed"> <p>🕑 Schedule an automation · Prisme.ai - 3 February 2023 - Watch Video</p> <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/860571466810477996287c9f61a63eed-1675441648113-with-play.gif"> </a>

### Supported native events  

Workspaces can only listen to a limited subset of the available native events :  

<center>
  <table>
    <tr>
      <td>Event name</td>
      <td>Description</td>
      <td>Payload fields</td>
    </tr>
    <tr>
      <td><b>workspaces.configured</b></td>
      <td>Workspace <a href="../#config">config</a> has been updated</td>
      <td>
        ```
        {
          "config": Config object from workspace.config
        }
        ```
      </td>
    </tr>
    <tr>
      <td><b>workspaces.apps.configured</b></td>
      <td>Some AppInstance config has been updated</td>
      <td>
        ```
        {
          "appInstance": AppInstance object from workspace.imports,
          "slug": AppInstance slug
        }
        ```
      </td>
    </tr>    
    <tr>
      <td><b>workspaces.apps.installed</b></td>
      <td>Some AppInstance has been installed</td>
      <td>
        ```
        {
          "appInstance": AppInstance object from workspace.imports,
          "slug": AppInstance slug
        }
        ```
      </td>
    </tr>        
    <tr>
      <td><b>workspaces.apps.uninstalled</b></td>
      <td>Some AppInstance has been uninstalled</td>
      <td>
        ```
        {
          "appInstance": AppInstance object from workspace.imports,
          "slug": AppInstance slug
        }
        ```
      </td>
    </tr>      
    <tr>
      <td><b>workspaces.deleted</b></td>
      <td>Workspace deleted</td>
      <td>
        ```
        {
          "workspaceId": workspace id
        }
        ```
      </td>
    </tr>                
    <tr>
      <td><b>apps.published</b></td>
      <td>Workspace published as an app</td>
      <td>
        ```
        {
          "app": App object
        }
        ```
      </td>
    </tr>                    
    <tr>
      <td><b>apps.deleted</b></td>
      <td>Workspace app unpublished</td>
      <td>
        ```
        {
          "appSlug": Unpublished app slug
        }
        ```
      </td>
    </tr>              
    <tr>
      <td><b>runtime.fetch.failed</b></td>
      <td>A fetch received a 4xx or 5xx HTTP status</td>
      <td>
        ```
        {
          "request": fetchInstructionBody,
          "response": {
            "status": 500,
            "body": {...},
            "headers": {...}
          }
        }
        ```
      </td>
    </tr>  
    <tr>
      <td><b>runtime.webhooks.triggered</b></td>
      <td>A webhook has been called</td>
      <td>
        ```
        {
          "request": fetchInstructionBody,
          "response": {
            workspaceId: "workspace id",
            automationSlug: "webhook slug",
            method: "httm method"
          }
        }
        ```
      </td>
    </tr>   
    <tr>
      <td><b>runtime.schedules.triggered</b></td>
      <td>A schedule has been triggered</td>
      <td>
        ```
        {
            workspaceId: "workspace id",
            automationSlug: "automation slug",
            schedule: "*/15 * * * *"
        }
        ```
      </td>
    </tr>
    <tr>
      <td><b>runtime.automations.scheduled</b></td>
      <td>An automation has been succesfully scheduled following its schedules</td>
      <td>
        ```
        {
            slug: "automation slug",
            schedules: [
              "*/15 * * * *"
            ]
        }
        ```
      </td>
    </tr>
    <tr>
      <td><b>workspaces.pages.permissions.shared</b></td>
      <td>Some page has been shared with someone</td>
      <td>
        ```
          {
          "subjectId": "<pageId>",
          "permissions": {
              "email": "<user email>",
              "policies": {
                "read": true
              },
              "id": "<user id>"
            }
          }
        ```
      </td>
    </tr>    
    <tr>
      <td><b>workspaces.pages.permissions.deleted</b></td>
      <td>Someone's access to the page has been removed</td>
      <td>
        ```
          {
            "subjectId": "<pageId>",
            "userId": "<user id>",
            "email": "<user email>"
          }
        ```
      </td>
    </tr>        
    <tr>
      <td><b>workspaces.versions.published</b></td>
      <td>A new workspace version has been committed</td>
      <td>
        ```
          {
            "version": {
              "name": "version name",
              "createdAt": "iso date",
              "description": "version description"
            }
          }
        ```
      </td>
    </tr>   
    <tr>
      <td><b>workspaces.versions.rollback</b></td>
      <td>A previous version has been rolled-back</td>
      <td>
        ```
          {
            "version": {
              "name": "version name",
              "createdAt": "iso date",
              "description": "version description"
            }
          }
        ```
      </td>
    </tr>                
  </table>    
</center>

All of these events and object types indicated by **Payload fields** column are fully described inside the **Schemas** section at the bottom of our [API Swagger](/api).

## Instructions  
Once triggered, the automation will execute every defined instruction one after another, as configured from your automation graph.  
Native instructions like **set**, **conditions** or **repeat** help structuring the execution flow and leveraging persistent contexts, while **fetch** and **emit** provide 2 ways of communicating with external services.  
**fetch** instruction sends an HTTP request and wait for its response before moving forward, and **emit** sends an **event** without expecting any response.  

Finally, automations can also directly call each others and retrieve their respective output.  

[More details on available instructions](../instructions)

## Arguments  

When calling a native instruction or another automation, differents arguments can be transmitted :  

![image](/assets/images/workspaces/automation_arguments.png)  

And there is the corresponding source code :  

```yaml
- set:
    name: slotFilling
    value:
      field: '{{field}}'
      question: '{{question}}'
```  

However, these graphical inputs are not reserved to native instructions, but can also be configured for your own custom automations. This is achieved by specifying the name of the expected arguments, alongside their expected type.  

For now, specifying these expected arguments must be done from the **arguments** field inside the automation source code, which follows [JSON Schema](https://json-schema.org/) standard.  

Here is the source code for an automation leveraging every supported graphical input :  
```yaml
  testArguments:
    name: testArguments
    arguments:
      someString:
        type: string
      someNumber:
        type: number
      someObject:
        type: object
        properties:
          someStringField:
            type: string
      someOtherObject:
        type: object
        properties:
          nestedObject:
            type: object
            properties:
              someField:
                type: number
      someStringArray:
        type: array
        items:
          type: string
      someObjectArray:
        type: array
        items:
          type: object
          properties:
            fieldA:
              type: string
      someRawJSON:
        type: object
        additionalProperties: true          
      someToken:
        type: string        
        secret: true
    do:
      ...
```  

When calling this automation, this form will show up :  
![image](/assets/images/workspaces/complex_arguments.png)  

... producing the following source code :  
```yaml
    - testArguments:
        someString: Hello world
        someNumber: '24'
        someObject:
          someStringField: My object field
        someOtherObject:
          nestedObject:
            someField: '1'
        someStringArray:
          - This is the first value of my array argument
        someObjectArray:
          - fieldA: foo
        someRawJSON:
          custom: JSON
```

The last **someToken** argument defined with **secret: true** does not differ visually, but is automatically redacted from native runtime events (i.e runtime.automations.executed, runtime.contexts.updated, ...). This avoids accidental leaks of sensitive information through native Prisme.ai events.

## Output  
Native instructions & automations can return some data that will be :   

* Answered to the calling URL trigger  
* Transferred to the calling automation, if any  

Inside the automation graph, the output can be configured with the latest block at the screen bottom.  

## Variables  
Inside your automation instructions, dynamic data can be injected by surrounding a variable name with double braces :  `{{some.variable.name}}`. Here, the double braces indicate that this word will be replaced with the corresponding variable value.  

As soon as your automation is created, a few variables is natively provided and ready to use (see [contexts](#contexts)), but more variables can be created/removed using [**set** and **delete** instructions](../instructions#variable-related). 

![image](/assets/images/workspaces/interpolation_brackets.png)

In case of objects or array variables, it is even possible to access a specific sub key using another variable, like this :  
```
{{session.myObjectVariable[{{item.field}}]}}
```

If `session.myObjectVariable` equals to `{"mickey": "house"}` and `item.field` equals to `mickey`, the entire expression will resolve to `house`.

## Contexts  
**Contexts** are special variables maintained accross executions in order to provide a persistent memory.  

6 contexts are available :  

* **global** : this context is shared by all authenticated users for the same workspace.  
* **user** : this context holds user-specific data and spans accross sessions    
* **session** : this context holds session-specific data. It is automatically removed when the user session expires, as defined by Gateway API. In case of a manually set session, it expires **1 hour**  after the last set (configurable with **CONTEXT_UNAUTHENTICATED_SESSION_EXPIRE_TIME** env var)
* **run** : this context holds some technical information about current run, and is automatically removed **60 seconds** after the last automation run (configurable with **CONTEXT_RUN_EXPIRE_TIME** env var)  
* **socket** : If user is connected through an events websocket, this context holds a temporary state local to this websocket, useful to separate state between multiple browser tabs for example.  This context automatically expires after 6h without any set  
* **config** : this context holds current [workspace](../#config) or [AppInstance](../apps#config-variable) config 
* **$workspace** : this read-only context holds current workspace definition, allowing to read any of its sections like installed apps config (i.e $workspace.imports.myApp.config)

Except for $workspace, all of these contexts might be written to using [set](../instructions#set) instruction, in which case written data would be persisted and made available in subsequent requests. The only exception is when setting variables inside session/user contexts from an unauthenticated webhook,  **user** and **session** will not be persisted.  

However, sessions can be manually created or switched by [setting](../instructions#set) the **session.id** field ; **user** and **session** contexts are then automatically reloaded with values from the targeted user contexts (or initialized, if the sessionId does not exist).  
This allows unauthenticated webhooks to retrieve persisted user / sessions contexts identified by custom webhook fields (i.e a facebook userId, ...).  

Any set variable to one of these contexts is automatically synchronized with parents or child automations triggered for the same run (i.e correlationId), making the freshly set variable visible in these parallel automations.


### Detailed contexts

#### Global
<center>
  <table>
    <tr>
      <td>Variable name</td>
      <td>Description</td>
    </tr>
    <tr>
      <td><b>global.workspaceId</b></td>
      <td>Current workspaceId</td>
    </tr>       
    <tr>
      <td><b>global.workspaceName</b></td>
      <td>Current workspace name</td>
    </tr>           
    <tr>
      <td><b>global.apiUrl</b></td>
      <td>Current API instance public url (fulfilled by runtime **API_URL** variable)</td>
    </tr>           
    <tr>
      <td><b>global.endpoints</b></td>
      <td>Map of available endpoint slugs to the corresponding public url</td>
    </tr>           
    <tr>
      <td><b>global.studioUrl</b></td>
      <td>Current studio instance public url (fulfilled by runtime **STUDIO_URL** variable)</td>
    </tr>           
    <tr>
      <td><b>global.pagesUrl</b></td>
      <td>Current workspace pages public url (built from workspace slug and runtime **PAGES_HOST** variable)</td>
    </tr>                       
    <tr>
      <td><b>global.pagesHost</b></td>
      <td>Current pages instance base domain (fulfilled by runtime **PAGES_HOST** variable)</td>
    </tr>                           
  </table>
</center>

#### User
<center>
  <table>
    <tr>
      <td>Variable name</td>
      <td>Description</td>
    </tr>
    <tr>
      <td><b>user.id</b></td>
      <td>Current user id</td>
    </tr>       
    <tr>
      <td><b>user.email</b></td>
      <td>If available, current user email</td>
    </tr>           
    <tr>
      <td><b>user.authData</b></td>
      <td>Detailed authentication data from various auth providers this user logged in with</td>
    </tr>    
    <tr>
      <td><b>user.role</b></td>
      <td>If any, current user role</td>
    </tr>                   
  </table>
</center>


#### Session
<center>
  <table>
    <tr>
      <td>Variable name</td>
      <td>Description</td>
    </tr>
    <tr>
      <td><b>session.id</b></td>
      <td>Current session id</td>
    </tr>     
  </table>
</center>  

If current user has been authenticated through the Gateway API (whether anonymously or not), the **session** context expiration depends on the value configured in the Gateway API (1 month by default).  
If current user comes from an unauthenticated [**endpoint**](#url) call, its **session** context will expire after **1 hour**, configurable from **CONTEXT_UNAUTHENTICATED_SESSION_EXPIRE_TIME** environment variable.  

#### Run
<center>
  <table>
    <tr>
      <td>Variable name</td>
      <td>Description</td>
    </tr>
    <tr>
      <td><b>run.depth</b></td>
      <td>Current automation depth in the stacktrace</td>
    </tr>
    <tr>
      <td><b>run.correlationId</b></td>
      <td>Current run correlationId</td>
    </tr>    
    <tr>
      <td><b>run.socketId</b></td>
      <td>Current socket id, if connected by websocket</td>
    </tr>        
    <tr>
      <td><b>run.appSlug</b></td>
      <td>If running from an appInstance, current app slug</td>
    </tr>        
    <tr>
      <td><b>run.appInstanceSlug</b></td>
      <td>If running from an appInstance, current appInstance slug</td>
    </tr>            
    <tr>
      <td><b>run.parentAppSlug</b></td>
      <td>If parent is also an appInstance, parent app slug</td>
    </tr>       
    <tr>
      <td><b>run.date</b></td>
      <td>Current ISO8601 date</td>
    </tr>           
    <tr>
      <td><b>run.trigger.type</b></td>
      <td>Trigger type of the current automation run (event, endpoint, automation)</td>
    </tr>        
    <tr>
      <td><b>run.trigger.value</b></td>
      <td>Trigger value of the current automation run (event/endpoint/ automation name)</td>
    </tr>        
    <tr>
      <td><b>run.automationSlug</b></td>
      <td>Current automation slug</td>
    </tr>                       
    <tr>
      <td><b>run.ip</b></td>
      <td>Source event or HTTP request IP</td>
    </tr>                           
  </table>
</center>
