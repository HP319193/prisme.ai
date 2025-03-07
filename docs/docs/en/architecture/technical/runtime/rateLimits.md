# Description

While executing workspaces automations, **Runtime** enforces 4 distincts rate limits :  

* **Automations** execution
* Event **emits**
* HTTP **fetchs**  
* **repeat** loops

Each workspace has its own rate limits for each of these instructions.  
Moreover, these rate limits are local to each **runtime** instance and not shared between multiple **runtime** instances : thus, global rate limits for a workspace will increase as new runtime instances are created.  

For example, with 2 **runtime** instances and a workspace **A** that has a 100 automation executions / second rate limit, workspace A **might** reach 200 automations / s.  
In order for this workspace to benefit from this maximum global limit of 200 automations / seconds, it must leverage **events** emits & triggers to evenly distribute automations executions accross the cluster.  

On the contrary, a single automation calling 2000 other automations in a row will be entirely executed by the same and single instance which processed the initial trigger, and thus will be throttled & not exceed 100 automations / seconds :  

```yaml
slug: thisWillBeThrottled
do:
  - repeat:
      on: 2000
      do:
        - callSomeOtherAutomation: {}
```

Instead, it could be easily rewritten using `emits` to asynchronously distribute these 2000 calls accross the available instances :  
```yaml
do:
  - repeat:
      on: 2000
      do:
        - emit:
            event: triggerSomeOtherAutomation
            payload: {}

---
# The second automation:  

slug: callSomeOtherAutomation
when:
  events:
    - triggerSomeOtherAutomation
do: []
```
In this example, note that 2 other rate limits will apply : emits and repeats.  

When an automation is throttled (regardless of the type of rate limit reached), a `payload.throttled` field indicates for how long inside its `runtime.automations.executed` event.  
The same amount of time is also included in the corresponding `payload.duration` field.  

# Default limits

**Burst rate :** During a momentary peak usage, number of times that can be executed before being throttled to the normal rate.  

Default rate limits can be configured for all workspaces with environment variables, or can be configured per workspace with `prismeai_*` [workspace secrets](/workspaces/#secrets) (restricted to super admins).  

Rate limits can also be disabled for a specific workspace with `prismeai_ratelimit_disabled: true` secret.  

<table>
  <tr>
    <td>Type</td>
    <td>Rate/s</td>
    <td>Environment variable</td>
    <td>Workspace secret</td>
    <td>Burst rate</td>
    <td>Environment variable</td>
    <td>Workspace secret</td>
  </tr>

  <tr>
    <td>Automations execution</td>
    <td>100</td>
    <td>RATE_LIMIT_AUTOMATIONS</td>
    <td>prismeai_ratelimit_automations</td>
    <td>400</td>
    <td>RATE_LIMIT_AUTOMATIONS_BURST</td>
    <td>prismeai_ratelimit_automations_burst</td>
  </tr>    

  <tr>
    <td>Emits</td>
    <td>30</td>
    <td>RATE_LIMIT_EMITS</td>
    <td>prismeai_ratelimit_emits</td>
    <td>100</td>
    <td>RATE_LIMIT_EMITS_BURST</td>
    <td>prismeai_ratelimit_emits_burst</td>
  </tr>    

  <tr>
    <td>HTTP fetchs</td>
    <td>50</td>
    <td>RATE_LIMIT_FETCHS</td>
    <td>prismeai_ratelimit_fetchs</td>
    <td>200</td>
    <td>RATE_LIMIT_FETCHS_BURST</td>
    <td>prismeai_ratelimit_fetchs_burst</td>
  </tr>        

  <tr>
    <td>Repeat iterations</td>
    <td>1000</td>
    <td>RATE_LIMIT_REPEATS</td>
    <td>prismeai_ratelimit_repeats</td>
    <td>4000</td>
    <td>RATE_LIMIT_REPEATS_BURST</td>
    <td>prismeai_ratelimit_repeats_burst</td>
  </tr>        

</table>

* Setting one of the above environment variables to 0 disable the corresponding rate limit for all workspaces.  
* Rate limits can be disabled for all workspaces with `RATE_LIMIT_DISABLED=true` environment variable.
