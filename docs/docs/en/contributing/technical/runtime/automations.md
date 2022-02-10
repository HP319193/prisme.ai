# Automations

**prisme.ai-runtime** executes what (`automatio.do` field) is described by workspaces **automations** against their respective trigger (`automation.when` field) payload.    

## Triggers  

### endpoint  
When an automation activates its **when.endpoint** field, it becomes publicly available through `/webhooks/:automationSlug` API (i.e see Swagger).  
The automation can access input HTTP request with the following variables :  
- **body**  
- **headers**  
- **method**  
- **query**  

### events  
An automation can also listen to a list of events with **when.events** field.  
Whenever such events are received, the automation is executed & can directly access inner payload fields.

## Instructions  
Once triggered, the instructions list defined by the **do** field will be executed sequentially.  
Native instructions like **set**, **conditions** or **repeat** help structuring the execution flow and leveraging persistent contexts, while **fetch** and **emit** provide 2 ways of communicating with external services.  
**fetch** instruction sends an HTTP request and wait for its response before moving forward, and **emit** sends an **event** without expecting any response.  

Finally, automations can call each others by their respective **automation slug** (their unique & technical name).

## Output  
Native instructions & automations can return some data which the caller automation can read using the instruction **output** field.  
In the case of an automation triggered by webhook, this **output** will be directly handed to the HTTP response.

## Contexts  
Using `set` / `delete` instructions and `{{myVariable}}` interpolation brackets, automations can write & read custom variables in their local context, automatically removed at the end of the automation.  

In addition, 3 native & persistent contexts are provided :  
- **global** : this context is shared by all authenticated users for the same workspace.  
- **user** : this context holds user-specific data  
- **session** : this context holds session-specific data. It is automatically removed **15 minutes** (configurable with **CONTEXT_SESSION_EXPIRE_TIME** env var) after the last write access (i.e by **set** or **output**)
