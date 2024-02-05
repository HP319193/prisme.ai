# Description

The **Events** service is in charge of :

- Enabling the **consumption of events** from an external service in web socket or HTTP long polling
- Allowing the **emission of events** from an external service in web socket or HTTP long polling
- **<span dir="">Historization</span>** (storage in a data lake) of each event handled by the message broker
- **Searching** for events through various filters directly from the data lake

# Technical stack

<table>
  <tr>
    <td>Library</td>
    <td>Role</td>
    <td>Version</td>
  </tr>

  <tr>
    <td>
      <a href="https://github.com/expressjs/express" target="_blank">Express</a>
    </td>
    <td>HTTP framework</td>
    <td>4.17.1</td>
  </tr>

  <tr>
    <td>
      <a href="https://github.com/cdimascio/express-openapi-validator" target="_blank">express-openapi-validator</a>
    </td>
    <td>Swagger-based syntax validation of incoming requests</td>
    <td>4.13.4</td>
  </tr>

  <tr>
    <td>
      <a href="https://socket.io/" target="_blank">socket.io</a>
    </td>
    <td>Web sockets</td>
    <td>4.4.1</td>
  </tr>  

  <tr>
    <td>
      <a href="https://github.com/elastic/elasticsearch-js" target="_blank">@elastic/elasticsearch</a>
    </td>
    <td>Events storage</td>
    <td>7.16.0</td>
  </tr>    

  <tr>
    <td>
      <a href="https://gitlab.com/prisme.ai/prisme.ai/-/tree/main/packages/broker" target="_blank">
        @prisme.ai/broker
      </a>    
    </td>
    <td>Message broker interface</td>
    <td>latest</td>
  </tr>

  <tr>
    <td>
      <a href="https://gitlab.com/prisme.ai/prisme.ai/-/tree/main/packages/permissions" target="_blank">
        @prisme.ai/permissions
      </a>        
    </td>
    <td>Authorization</td>
    <td>latest</td>
  </tr>  
</table>

# Design

## Events & API

[Documentation](/api)


### Scaling Websockets

To enable websockets with HTTP fallback (i.e default setting, useful in case of client side firewall restrictions) and multiple `prismeai-events` instances, HTTP traffic towards `prismeai-events` must be forwarded with sticky session : requests from the same agent must be forwarded to the same `prismeai-events` instance.  
Indeed, by default, [client socket.io](https://socket.io/docs/v4/using-multiple-nodes#why-is-sticky-session-required) will establish websocket sessions with a few HTTP requests that must be processed by the same server. When there are multiple servers and no sticky sessions, end users will not be able to connect to to `prismeai-events` (with HTTP 400 errors `Session ID unknown`), and thus not be able to send or receive events.  

As mentioned in [socket.io](https://socket.io/docs/v4/using-multiple-nodes#why-is-sticky-session-required) documentation, HTTP fallback can be disabled to force websocket establishement in a single & persistent TCP connection, avoiding the need for sticky sessions.  

Otherwise, some kind of proxy or service mesh must be setup to configure sticky sessions between `prismeai-api-gateway` and `prismeai-events`.  
Example with Istio on Kubernetes :  
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: events-sticky-session
spec:
  host: prismeai-events-svc
  trafficPolicy:
    loadBalancer:
      consistentHash:
        httpHeaderName: 'user-agent' # Identiy same users with user agent header
```



## Performance

Minimum resources shall be tested and specified so that 99% of external consumers receive each event in less than **N** milliseconds when a total of **M** events per second are processed by the same workspace.

# Quality

## Development standards and quality measurement

The required quality level corresponds to the recommended SonarQube Quality Gate:

- 80% minimum code coverage
- 3 % max of duplicated lines
- Level A in Maintainability, Reliability and Security

## Logs

Any action is logged into two different ways:

- Trace of the HTTP call if there is one (produced at the Gateway API level)
- Transcription of the action as an event (produced by the service handling the action)

In both cases, all the usual contextual information is included (provided by the common bootstrap between the backend services).  
As a minimum, this information should include : :

- Correlation id
- User id
- Workspace id
- Timestamp
- Log criticality

## Errors

Technical errors (aka unexpected errors) such as a timeout on a REST service call are caught by the service and logged with the full stack trace. 

If this error occurs during the processing of an HTTP request, the caller simply receives a generic "Internal Error".

In addition to the error logs, the error is also transmitted as a generic error event.

Both in the log and in the event, the usual contextual information is included as much as possible (see [Logs](#logs)).

## Supervision

Just like the other backend micro services, this one provides different administration routes:

- /metrics : Prometheus
- /sys/logging : dynamically change log details
- /sys/heapdump : Generate a memory dump that can be retrieved from the instance and loaded into Chrome for easy debugging
- /sys/healthcheck : Returns a code 200 if the instance is "healthy"

# Security

# Company Social Responsibility (CSR)

# Linting

The code should be formatted using Prettier, using the version specified in the package.json
