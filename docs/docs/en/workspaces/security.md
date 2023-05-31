# Security

Workspace security is managed through a **Role Based Access Control** (RBAC) authorization model, in order to validate each input API call and both input/output events based on authenticated user role.  

## Authorizations

Each workspace can tune this authorization model by attaching **rules** either to a specific role (native or custom) or public access (everyone including anonymous user) if no role is specified.  
Authorization rules can be viewed & edited at anytime from https://studio.prisme.ai by accessing the workspace top gear wheel and clicking on "Manage roles".  
You should then see the default authorization rules, tuning **Editor** role & some public rules, described below. Owner role cannot be edited.  

Custom roles can be added at the top of the security config, example :  
```yaml
authorizations:
  roles:
    editor: {}
    # Custom role : 
    agent: {}
  rules:
    ...
```

### Rule structure

Each rule must define at least these 2 fields :  

* **action** : Target action name or list of names
* **subject** : Target subject type or list of subjects 

By default, rules **allow** the given **action** for the given **subject** type.  
Some subjects have their specific actions which won't have any effect when allowed for another subject type. See available [subjects & actions](#subjects-and-actions).  

Rules can be more precisely configured using the following optional fields :  

* **role** : Only apply this rule for the specified role
  * If not set, the rule will apply to everyone (including anonymous users or editors)
* **conditions** : Match subjects by filtering on their fields using a [subset of MongoDB query syntax](https://casl.js.org/v4/en/guide/conditions-in-depth#supported-operators).
  * Rule does not apply if specified conditions does not match with given subject.  
  * A rule without any conditions (or an empty object) will apply to every instance of specified **subject**
* **inverted** : If set to true, **deny** given action (instead of allow).  
  * Rules are executed in the same order they as appear in your configuration, meaning an **inverted** rule won't have any effect if it's followed by an **ALLOW** rule without any **conditions**.  
* **reason** : A string that will be returned by API on denied requests  

See [default security config](#default-security-config) for a full example.  

### Subjects and Actions

**Available subjects and their specific actions :**  

* **workspaces**
  * manage_security :  allows updating security configuration
  * manage_permissions : allows sharing / unsharing
  * aggregate_search : allows using /search API  
  * get_usage : allows using /usage API
* **apps**
* **pages**
* **files**
* **automations**
  * execute : allows executing the automation (regardless the trigger method is)
* **events**

**Shared actions :**  

* **read** : Allow reading
* **update** : Allow updating
* **create** : Allow creating
* **delete** : Allow deleting
* **manage** : Allow every actions (including specific ones shown below)

## Default security config

Here is the default security configuration with comments explaining each part
```yaml
authorizations:
  roles:
    # Here we declare our additional "editor" role
    editor: {}
    # Any custom role can be added here, example :  
    agent: {}
  rules:
  # Editors can view & update a workspace, retrieve its usage & use /search API
  - role: editor
    action:
    - read
    - get_usage
    - aggregate_search
    - update
    subject: workspaces

  # Editors have all CRUD capabilities on uploaded files
  - role: editor
    action: manage
    subject: files

  # Editors can view & update workspace pages
  - role: editor
    action:
    - read
    - update
    subject: pages

  # Editors can publish the workspace as an app
  - role: editor
    action:
    - read
    - update
    subject: apps

  # Editors can view & create any event
  - role: editor
    action:
    - read
    - create
    subject: events

  # Editor cannot read apiKeys related events
  - role: editor
    inverted: true
    action: read
    subject: events
    conditions:
      type:
        "$regex": "^apikeys\\\\.*$"

  # Anyone can emit any event 
  - action: create
    subject: events
    reason: Anyone can create any events
    conditions:
      source.serviceTopic: topic:runtime:emit # Note that without this line, anyone could also emit native events !

  # Anyone can read any emitted events (exclude native events) inside his own session (i.e workspace emitted events while processing this user's events)
  - action: read
    subject: events
    conditions:
      source.serviceTopic: topic:runtime:emit
      source.sessionId: "{{session.id}}"
    reason: Anyone can read any events from its own session

  # Anyone can upload anything 
  - action: create
    subject: files
    conditions:
      mimetype:
        "$regex": "^(.*)$" # We could filter allowed mimetypes using this regexp
    reason: Anyone can upload any file
```

## Considerations  
A few security considerations to have when using default security configuration :  
1. **Everyone can create any event :** This means everyone can create any event & thus execute any automation with an event trigger
2. **Everyone can execute any automation :** Regardless of the automation trigger (event or endpoint), everyone is allowed to execute any automation  
3. **Everyone can read any event emitted in his session :** Once an automation has been triggered by the user, every child emits will be visible to the user, potentially giving him access to **internal events** or **sensitive events** from unrestricted automations (i.e getAnalytics automation used by some admin page)    

For event triggered automations, all three issues could be solved by tuning **create events** related rules, using one of these methods :  

* Add conditions to "everyone can create any event" default rule :  
```yaml
  - action: create
    subject: events
    reason: Anyone can create any events
    conditions:
      type:
        $in:
          - initHome 
          - initChatbot
          - sendInput
    # or : 
    conditions:
      type:
        $regex: ^(init.*|sendInput)$   
```

* ... or restrict the "everyone can create any event" default rule to a specific custom role :  
```yaml
  - role: agent
    action: create
    subject: events
    reason: Only agents can create any events
```

* ... or keep default events related rules, but [restrict automations execution](#securing-automations)

## Securing automations
By default, anyone can execute any automation, provided it has some available trigger :  

* Event trigger (if the user is allowed to emit given events)
* Endpoint trigger (by default even allowed to unauthenticated requests)
* Direct call from another automation available by event/endpoint trigger

All three scenarios can be secured by configuring the **authorizations.action** automation field :  
```yaml
slug: getAnalytics
name: "Admin Page : Init Analytics"
description: "This automation should only be allowed to Admin role, as it will emit an event with analytics data inside user session"
when:
  events:
    - initAnalytics
do:
  - emit:
      event: updateAnalytics
      payload:
        data: [...]
authorizations:
  action: admin # Set any name you like
```

By default, only **Owners** and **Editors** are allowed to execute automations with an **authorizations.action** declared.  
In order to let a custom role **Admin** execute this automation, we can add the following rule :  
```yaml
- role: Admin
  action: execute
  subject: automations
  conditions:
    authorizations.action:
      $in:
        - admin
```

Note that this automation will stay restricted even if directly called from another automation triggered by event/endpoint.  

## Sharing pages  
Instead of sharing a page to multiple individuals users, we can share this page to one or more roles, and then share the workspace to the desired users with one of these allowed roles.  
This way, we can manage allowed users in a single central place (workspace share modal) & share/unshare multiple pages with a single user at once.  

This can and should be combined with [automations securing](#securing-automations) in order to restrict sensitive automations/data to the same roles we already shared our pages with.  

## API Keys
In order to grant some request/user session with additional permissions not available to the authenticated user, we can create API Keys with same rules syntax as defined here, and inject it within a `x-prismeai-api-key` header.  
See our [API Swagger documentation](/api) in order to manage workspace API Keys

