# Description

**Runtime** service is in charge of the workspaces execution depending on declared triggers, such as : events, dates or HTTP.

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

**An event related to a workspace cannot be handled before the previous event (related to a specific workspace for one particular session) has been fully handled.**

## Performance

Performance tests on different example DSULs should be carried out at each major release change, and the test result written up and referenced by this section.
The example DSULs are to be defined, but they should represent different real-life cases as well as some non-standard cases, and be as unitary as possible.

List example:

- Workflow using a function app.
- Workflow with a condition.

## Limits & Checks

<table>
<tr>
<td>Feature</td>
<td>Limit type</td>
<td>Value</td>
<td>Action if exceeded</td>
<td>Comments</td>
</tr>
<tr>
<td>Trigger by event</td>
<td>Number of events **processed** for a specific correlationId</td>
<td>20</td>
<td>The 21th event is ignored in order to stop the chain</td>
<td>N/A</td>
</tr>
<tr>
<td>Contexts</td>
<td>Memory space (in KB) used by all the contexts in one workspace</td>
<td>10 KB</td>
<td>Once the limit reached, the workspace is "paused" (triggers become inactive -- impossible to trigger any automation).</td>
<td>The admin should be able to clean up the workspace memory</td>
</tr>
</table>

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

# Linting

The code should be formatted using Prettier, using the version specified in the package.json
