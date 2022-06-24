# Instructions

## Logic-related 

### Conditions
Conditionally execute instructions

**Parameters :**  

No parameter

**Children nodes :**  
Every conditions will be represented as parallel branches on your graph, each beginning with a blue box allowing you to edit the condition itself, followed by the instruction that you will add for that specific condition.  

A **default** branch is automatically added to configure what instructions to execute when no other condition matches.   

[More details on Conditions syntax](../conditions)

### Repeat
Execute a list of instructions N times, or for each record from an array or object variable

**Parameters :**  

* **on** : An array or object variable name to loop on. Each record will be available inside an **item** variable  
* **until** : A number of times to repeat this loop. Each iteration number will be stored inside an **item** variable  

If **on** and **until** parameters are used together, only the first **until** items from **on** will be iterated.  

**Children nodes :**  
When adding a **Repeat** instruction, a new graph branch will appear, allowing you to create the instructions that will be repeated.  

### Break
Stops currently executing automation

**Parameters :**  

* **scope** : If set to **all**, breaks all parents automations

### All
Execute the given instructions in parallel  

_Coming soon_

## Variable-related

### Set
Set a new or existing variable

**Parameters :**  

* **name** : Variable name  
* **value** : Variable value (might be a JSON object, a string, a number, ...)  
* **lifespan** : _Coming soon_


When setting object fields, parent objects are created on-the-fly :  
```
- set:
    name: some.house.field
    value: ok
```
Here, `some` and `some.house` are automatically created : 
```
  "some": {
    "house": {
      "field": "ok
    }
  }
```

It is also possible to create lists and automatically add items to their end with a variable name suffix `[]` : 
```
- set:
    name: session.names[]
    value: Mickael
```

Each time this set is executed, `Mickael` is appended to the `session.names` list variable.

### Delete
Delete a variable  

**Parameters :**  

* **name** : Variable name

## Interaction-related 

### Fetch
Sends an HTTP request to call external web services  

**Parameters :**  

* **URL** : Target URL
* **method** : Request method (get | post | put | patch | delete)
* **headers** : Request headers  
* **query** : Query string (as an object)
* **body** : Request body (might be a JSON object, a string, a number, ...)  
* **multipart** : List of field definitions for multipart/form-data requests
* **output** : Name of the variable that will store the response body  

When receiving 4xx or 5xx HTTP errors, a native event `runtime.fetch.failed` is automatically emitted, including both request & response contents.  

If **Content-Type** header is set to 'application/x-www-form-urlencoded', the **body** will be automatically transformed as an urlencoded body.  

**multipart**  

```
- fetch:
    url: ..
    multipart:
      - fieldname: file
        value: someBase64EncodedFile
        flename: filename.png # Required if value is a file 
      - fieldname: metadata
        value: some random metadata
```

### Emit
Emit a new event.  

**Parameters :**  

* **event** : Event name  
* **payload** : JSON object that will be sent as the event payload  


### Wait
Wait for an event. Pauses the current execution until the requested event is received.  

**Parameters :**  

* **oneOf** : Pauses until **one** of these events is received
* **timeout** : If **waits** timeouts after **N** seconds, resume execution & outputs an empty result. Defaults to **20**
* **output** : Name of the variable that will store the received event  

**oneOf parameter :**  
List of event candidates with the following parameters :  

* **event** : Event name, required  
* **filters** : Free form JSON object for filtering on any event fields. For example :  
```yaml
- wait:
    oneOf:
      event: someEvent
      filters:
        source.correlationId: '{{run.correlationId}}'
```
* **cancelTriggers** : If true, cancels the execution of the usual triggers for this event. Other **waits** still receive this event.  

**Waiting for an event triggered automation to finish**  

In addition to every regular events which might be directly listened by automations, **wait** instruction can also waits for **runtime.automations.executed** event.  
This native events tells when an automation finishes executing, with its source trigger & output.  
Waiting for this allows you to emit an event, than hang until whichever automation that received it finishes processing :  

```yaml
  AutomationA:
    name: AutomationA
    when:
      endpoint: true
    output: '{{output}}'
    do:
      - emit:
          event: 'someEvent'
          output: emittedIntentEvent
      - wait:
          oneOf:
            - event: runtime.automations.executed
              # Filters specifically for our emited event
              filters:
                payload.trigger.id: '{{emittedIntentEvent.id}}'
          output: event
      - set:
          name: output
          value: '{{event.payload.output}}'

  AutomationB:
    name: AutomationB
    when:
      events:
        - someEvent
    output: 'someOutput'
    do: []
```
