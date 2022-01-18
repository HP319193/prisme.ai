# Description

The **Events** service is in charge of :

- Enabling the **consumption of events** from an external service in websocket or HTTP long polling
- Allowing the **emission of events** from an external service in websocket or HTTP long polling
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
      [Express](https://github.com/expressjs/express)
    </td>
    <td>HTTP framework</td>
    <td>4.17.1</td>
  </tr>

  <tr>
    <td>
      [express-openapi-validator](https://github.com/cdimascio/express-openapi-validator)
    </td>
    <td>Swagger-based syntax validation of incoming requests</td>
    <td>4.13.4</td>
  </tr>

  <tr>
    <td>@prisme.ai/broker</td>
    <td>Message broker interface</td>
    <td>latest</td>
  </tr>
</table>

# Design

## Events & API
Produced events : 
- **runtime.workflow.triggered**
- **runtime.contexts.updated**

[Documentation](https://gitlab.com/prisme.ai/prisme.ai/-/blob/main/specifications/swagger.yml)

## Handling concurrency

In order to allow external consumers to handle events and be able to scale on multiple instance while using websocket, our **Events** service shall offer a **message queue** mode to consume these. \
In other words : only "distribute" one copy of each event to one of those instances (instead of one copy to each instance). \
\
By default, on event is forwarded to each websocket client subscribed to this kind of event.

## Performance

Minimum resources shall be tested and specified so that 99% of external consumers receive each event in less than **N** milliseconds when a total of **M** events per second are processed by the same workspace.

# Quality

## Development standards and quality measurement

Example : 

The required quality level corresponds to the recommended SonarQube Quality Gate:

* 80% minimum code coverage
* 3 % max of duplicated lines
* Level A in Maintabily, Reliability and Security

## Tests specifics

<table>
<tr>
<td>Test type</td>
<td>Manual / Automated</td>
<td>Type of module</td>
<td>Code coverage</td>
<td>Detail</td>
</tr>
<tr>
<td>UT</td>
<td>Automated</td>
<td>Backend & Frontend</td>
<td>Approximately 70%</td>
<td>N/A</td>
</tr>
<tr>
<td>E2E</td>
<td>Automated</td>
<td>UI</td>
<td>30%, happy paths</td>
<td>N/A</td>
</tr>
<tr>
<td>API</td>
<td>Automated</td>
<td>Backend</td>
<td>Approximately 70%</td>
<td>N/A</td>
</tr>
</table>

## Logs

Any action is logged into two different ways:

- Trace of the HTTP call if there is one (produced at the Gateway API level)
- Transcription of the action as an event (produced by the service handling the action)

In both cases, all the usual contextual information is included (provided by the common bootstrap between the backend services).\
As a minimum, this information should include : :

- Correlation id
- User id
- Workspace id
- Timestamp
- Log criticality

## Errors

Technical errors (aka unexpected errors) such as a timeout on a REST service call are caught by the service and logged with the full stacktrace. Only operational errors (those explicitly thrown) with a FATAL criticality (if not specified by the developer, the criticality is simply ERROR) are logged.

If this error occurs during the processing of an HTTP request, the caller simply receives a generic "Internal Error".

In addition to the logs thus produced, the error is transmitted as a generic error event.

Both in the log and in the event, the usual contextual information is included as much as possible (see [Logs](#logs)).

## Supervision

Just like the other backend microservices, this one provides different administration routes:

- /metrics : Prometheus
- /sys/logging : dynamically change log details
- /sys/heapdump : Generate a memory dump that can be retrieved from the instance and loaded into Chrome for easy debugging
- /sys/healthcheck : Returns a code 200 if the instance is "healthy"

# Security

TODO : To complete with results from testing tools

# Company Social Responsability (CSR)

Examples :

- Use lazy loading for occasional resource loading
- Limit databases results with pagination
- Group massive processing into more effective batchs

TODO : detail & include specific metrics from the first RSE audits

# Hosting

Dockerfile, docker-compose and Helm chart ready to use.
