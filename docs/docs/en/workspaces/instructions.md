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

- **on** : An array or object variable name to loop on. Each record will be available inside an **item** variable, and current index will be inside an **$index** variable.
- **until** : A number of times to repeat this loop. Each iteration number will be stored inside an **item** variable

If **on** and **until** parameters are used together, only the first **until** items from **on** will be iterated.

**Children nodes :**  
When adding a **Repeat** instruction, a new graph branch will appear, allowing you to create the instructions that will be repeated.

### Break

Stops currently executing automation

**Parameters :**

- **scope** : If set to **all**, breaks all parents automations

### All

Execute the given instructions in parallel

_Coming soon_

## Variable-related

### Set

Set a new or existing variable

**Parameters :**

- **name** : Variable name
- **value** : Variable value (might be a JSON object, a string, a number, ...)
- **type** : **replace** to replace target variable with given value, **merge** to try merging objects or arrays, or **push** to push to an array. **replace** by default

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
    name: session.names
    type: push
    value: Mickael
# or :
- set:
    name: session.names[]
    value: Mickael
```

Each time this set is executed, `Mickael` is appended to the `session.names` list variable.  

Same feature with **type: merge** option :  
```
- set:
    name: session.names
    type: merge
    value: Mickael
```

When both previous value and **value** are arrays, **type: merge** concatenate **value** at the end of the previous value :  
```yaml
- set:
    name: myArray
    value:
      - one
- set:
    name: myArray
    type: merge
    value:
      - two
      - three
# {{myArray}} = ['one', 'two', 'three']
```  

When both previous value and **value** are objects, **type: merge** merge them together :  
```yaml
- set:
    name: 'myObject'
    value:
      firstName: Martin
- set:
    name: 'myObject'
    type: merge
    value:
      age: 25 
# {{myObject}} = { "firstName": "Martin", "age": 25 }
```  

### Delete

Delete a variable

**Parameters :**

- **name** : Variable name

## Interaction-related

### Fetch

Sends an HTTP request to call external web services

**Parameters :**

- **URL** : Target URL
- **method** : Request method (get | post | put | patch | delete)
- **headers** : Request headers
- **query** : Query string (as an object)
- **body** : Request body (might be a JSON object, a string, a number, ...)
- **multipart** : List of field definitions for multipart/form-data requests
- **emitErrors** : Boolean enabling or disabling error events upon 4xx or 5xx responses. Enabled by default.  
- **output** : Name of the variable that will store the response body
- **stream** : For streamed responses, emit data chunks as they are received

When receiving 4xx or 5xx HTTP errors, a native event `runtime.fetch.failed` is automatically emitted, including both request & response contents.

If **Content-Type** header is set to 'application/x-www-form-urlencoded', the **body** will be automatically transformed as an urlencoded body.

**multipart**

```
- fetch:
    url: ..
    multipart:
      - fieldname: file
        value: someBase64EncodedFile | someBufferArray
        filename: filename.png # Required if value is a file
        contentType: image/png # Optional
      - fieldname: metadata
        value: some random metadata
```

**stream**
```yaml
- fetch:
    url: ..
    stream:
      event: chunk
      payload:
        foo: bar
```

Each chunk will be emitted like this :  
```json
{
  "type": "chunk",
  "payload": {
    "chunk": {
      "data": [
        "data1",
        "data2"
      ]
    },
    "additionalPayload": {
      "foo": "bar"
    }
  }
}
```
If data strings are JSON, they will be automatically parsed into objects.  
**stream** option also accepts **target** and **options** fields from emit instruction.  


### Emit

Emit a new event.  
Events size must not exceed **100Ko**, larger events are blocked and an error event is emitted.

**Parameters :**

- **event** : Event name
- **payload** : JSON object that will be sent as the event payload
- **target** : An optional object specifying this event target
- **autocomplete** : An optional object helping to find all events that can be computed when you set variables in your event value
- **private** : Optionnal Boolean. Exclude this event name from autocomplete values. Set it to `false` if you don't want your event is known from out of your application.
- **options** : optional object  

**target parameters :**

- **userId** : target user id
- **sessionId** : target session id
- **userTopic** : target userTopic

Event targets are automatically granted read access to the event

**options parameters :**  

- **persist** : boolean enabling or disabling events persistence. Enabled by default.  

**autocomplete parameter :**

When a field use an **autocomplete** widget and ask for **events:emit** or **events:listen** data source, they will be extracted from current workspace and all its installed apps instructions. If the event is a simple string, no problem, but if it contains variables, this is a way to help people to know what are the expected values.

- **from** : should be **config** to target the current workspace configuration or **appConfig** to target the installed app from where the instruction comes configuration.
- **path** : a JSON Path string starting from the **from** target. The syntax is described in [this project](https://github.com/JSONPath-Plus/JSONPath).
- **template** : sometimes the event name is not explicit because it comes from computed variables. You can help building values with a string containing static caracters and a `${value}` placeholder.

Exemples :

With this in your workspace DSUL:

```yaml
config:
  value:
    things:
      - foo
      - bar
```

```yaml
- emit:
    event: 'event.{{var}}'
    autocomplete:
      var:
        from: config
        path: things~
```

or

```yaml
- set:
    name: event
    value: 'event.{{var}}'
- emit:
    event: '{{event}}'
    autocomplete:
      var:
        from: config
        path: things~
        template: event.${value}
```

will generate automplete values : _event.foo_ and _event.bar_.

### Wait

Wait for an event. Pauses the current execution until the requested event is received.

**Parameters :**

- **oneOf** : Pauses until **one** of these events is received
- **timeout** : If **waits** timeouts after **N** seconds, resume execution & outputs an empty result. Defaults to **20**
- **output** : Name of the variable that will store the received event

**oneOf parameter :**  
List of event candidates with the following parameters :

- **event** : Event name, required
- **filters** : Free form JSON object for filtering on any event fields. For example :

```yaml
- wait:
    oneOf:
      event: someEvent
      filters:
        source.correlationId: '{{run.correlationId}}'
```

- **cancelTriggers** : If true, cancels the execution of the usual triggers for this event. Other **waits** still receive this event.

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

### createUserTopic

Create a new userTopic.

User topics allow sending events to multiple users without knowing who they are in advance, automatically granting them read access to these events without requiring any API Key.

**Parameters :**

- **topic** : Topic name
- **userIds** : List of the first userIds to join this topic

### joinUserTopic

Makes a given user join a userTopic.

Joining a userTopic automatically grants read access to any event sent within this topic.

**Parameters :**

- **topic** : Topic name to join
- **userIds** : List of the userIds to join this topic. If not defined, automatically pick current user's id
