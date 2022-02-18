# Description

**api-gateway** service is the only public endpoint of the architecture.  
The API Gateway enforces authentication, authorization, rate limits and others policies on incoming requests before dispatching them to the right micro service.


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
      <a href="https://gitlab.com/prisme.ai/prisme.ai/-/tree/main/packages/broker" target="_blank">
        @prisme.ai/broker
      </a>    
    </td>
    <td>Message broker interface</td>
    <td>latest</td>
  </tr>

  <tr>
    <td>
      <a href="https://www.npmjs.com/package/bcrypt" target="_blank">
        bcrypt
      </a>    
    </td>
    <td>Passwords hash library</td>
    <td>5.0.1</td>
  </tr>  

  <tr>
    <td>
      <a href="https://www.npmjs.com/package/helmet" target="_blank">
        helmet
      </a>    
    </td>
    <td>Express security helper</td>
    <td>5.0.1</td>
  </tr>    

  <tr>
    <td>
      <a href="https://www.npmjs.com/package/passport" target="_blank">
        passport
      </a>    
    </td>
    <td>Authentication middleware</td>
    <td>0.5.2</td>
  </tr>      

</table>

# Design

## Events & API

Produced events :

- **gateway.login.succeeded**
- **gateway.login.failed**

[Documentation](/api)

# Quality

## Development standards and quality measurement

The required quality level corresponds to the recommended SonarQube Quality Gate:

- 80% minimum code coverage
- 3 % max of duplicated lines
- Level A in Maintabily, Reliability and Security

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

Technical errors (aka unexpected errors) such as a timeout on a REST service call are caught by the service and logged with the full stack trace. 

If this error occurs during the processing of an HTTP request, the caller simply receives a generic "Internal Error".

In addition to the error logs, the error is also transmitted as a generic error event.

Both in the log and in the event, the usual contextual information is included as much as possible (see [Logs](#logs)).

# Security

# Company Social Responsability (CSR)

# Linting

The code should be formatted using Prettier, using the version specified in the package.json
