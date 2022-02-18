# Automations

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
Whenever such events are received, the automation is executed & can directly access inner payload fields.

## Instructions  
Once triggered, the automation will execute every defined instruction one after another, as configured from your automation graph.  
Native instructions like **set**, **conditions** or **repeat** help structuring the execution flow and leveraging persistent contexts, while **fetch** and **emit** provide 2 ways of communicating with external services.  
**fetch** instruction sends an HTTP request and wait for its response before moving forward, and **emit** sends an **event** without expecting any response.  

Finally, automations can also directly call each others and retrieve their respective output.  

[More details on available instructions](../instructions)

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

3 contexts are available :  

* **global** : this context is shared by all authenticated users for the same workspace.  
* **user** : this context holds user-specific data and spans accross sessions    
* **session** : this context holds session-specific data. It is automatically removed **15 minutes** (configurable with **CONTEXT_SESSION_EXPIRE_TIME** env var) after the last write access (i.e by **set** or **output**)

**Note that user and session contexts rely on an authenticated user id for being persisted**.  
In case the automation is triggered from a webhook without any session cookie / token, **user** and **session** will not be persisted, making any variable **set** not visible from subsequent requests (and possibly silently breaking some workspace functionnality).
