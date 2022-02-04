# Description

**Workspaces** service is in charge of workspace edition : CRUD operations on a workspace, CRUD on one of its automation or installation/configuration of an app.

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

**Note :** As with all other APIs, the DSUL validation of automations and workspaces is based entirely on their swagger. Thus, an up-to-date swagger means automatically updated and synchronized documentation and validation.

## Handling concurrency

To allow two administrators to edit two different automations of the same workspace, the backend must ensure that no information is lost in such a scenario.

To do this, the CRUD automation APIs will only receive one automation at a time, and the backend will take care of merging it with the rest of the workspace, without any possible loss of data due to 2 concurrent requests.

For this and if necessary, the backend can use a Redis lock (or other external system) so that 2 transactions cannot persist the workspace simultaneously.

# Quality

## Development standards and quality measurement

Example :

The required quality level corresponds to the recommended SonarQube Quality Gate:

- 80% minimum code coverage
- 3 % max of duplicated lines
- Level A in Maintabily, Reliability and Security

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

Technical errors (aka unexpected errors) such as a timeout on a REST service call are caught by the service and logged with the full stack trace. Only operational errors (those explicitly thrown) with a FATAL criticality (if not specified by the developer, the criticality is simply ERROR) are logged.

If this error occurs during the processing of an HTTP request, the caller simply receives a generic "Internal Error".

In addition to the logs thus produced, the error is transmitted as a generic error event.

Both in the log and in the event, the usual contextual information is included as much as possible (see [Logs](#logs)).

## Supervision

Just like the other backend micro services, this one provides different administration routes:

- /metrics : Prometheus
- /sys/logging : dynamically change log details
- /sys/heapdump : Generate a memory dump that can be retrieved from the instance and loaded into Chrome for easy debugging
- /sys/healthcheck : Returns a code 200 if the instance is "healthy"

# Security

TODO : To complete with results from testing tools

# Company Social Responsibility (CSR)

Examples :

- Use lazy loading for occasional resource loading
- Limit databases results with pagination
- Group massive processing into more effective batches

TODO : detail & include specific metrics from the first RSE audits

# Hosting

Dockerfile, docker-compose and Helm chart ready to use.

# Linting

The code should be formatted using Prettier, using the version specified in the package.json
