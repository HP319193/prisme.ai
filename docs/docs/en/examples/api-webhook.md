# AI-Enhanced API & Webhook Integration

This tutorial will guide you through creating streamlined automations using APIs and Webhooks, enhanced with AI capabilities using OpenAI Azure. The setup will demonstrate how to harness AI for generating summaries from incoming data and processing data using Custom Code without the need for manual database management. This approach provides a powerful yet simple way to integrate complex functionalities in your applications.

## Prerequisites

- Active account on Prisme.ai.
- Access to OpenAI Azure and Custom Code apps installed in your workspace.

## Tutorial Overview

This guide focuses on two key automations:

1. **Generate Summary**: Uses OpenAI's GPT-4 to create concise summaries from structured JSON data.

2. **Webhook**: Receives incoming data, processes it with Custom Code, and triggers the summary generation.

These automations teach you to handle incoming API requests effectively, process the data using custom functions, and utilize AI to add significant value to the data — all within a serverless environment, eliminating the need for traditional database management.

## Workspace and Application Setup

### Workspace Name: **AI API Integrator**

This workspace is designed as a hub for integrating AI-driven processes with external data flows via APIs and Webhooks.

### Required Apps:
- **OpenAI Azure**: For AI-powered text summarization.
- **Custom Code**: For data cleansing and preparation.

## Automations Detail

### 1. Generate Summary Automation
This automation is triggered by a specific event and uses OpenAI's GPT-4 model to generate a summary of the provided JSON data. The summary focuses on extracting key details and providing a concise overview.

```yaml title="Summary automation"
slug: generate-summary
name: Generate Summary
do:
  - set:
      name: stringifiedData
      value: '{% json({{payload.data}}) %}'
  - OpenAI.chat-completion:
      stream:
        options:
          persist: true
      model: gpt-4
      messages:
        - role: system
          content: Create a brief summary from a JSON object, focusing on key details and overarching information contained within, ensuring clarity and conciseness in the summary.
        - role: user
          content: '{{stringifiedData}}'
      output: genAIData
when:
  events:
    - summary-event
output: '{{genAIData.choices[0].message.content}}'
```

!!! note "Special functions"

    We first parse the JSON object as a string as the LLM awaits a string.
    This is done by using an utilitary function available within "condition evaluation" ({% ... %}). [See the condition documentation to learn more about evaluation.](../workspaces/conditions.md#conditions)

### 2. Webhook Automation
This endpoint automation receives data, processes it through a Custom Code function named `CleanData`, and emits the cleaned data along with the original payload to trigger the summary generation.

By making this automation accessible via a URL, the platform allows for the automatic triggering of an endpoint that can be integrated with various external systems such as CRM, email providers, ERPs, and more. This functionality facilitates seamless interactions across different platforms, enhancing your workflow automation.

```yaml title="Webhook automation"
slug: webhook
name: Webhook
do:
  - Custom Code.run function:
      function: CleanData
      output: cleanData
  - emit:
      payload:
        body: '{{body}}'
        headers: '{{headers}}'
        data: '{{cleanData}}'
      event: summary-event
when:
  endpoint: true
output:
  message: '{{cleanData}}'
```

#### How to Obtain the Endpoint URL

To retrieve the link to your automation's endpoint, follow these steps:

1. **Access the Automation Settings:** Navigate to the automation you've set up in your workspace.
2. **Trigger Configuration:** Click on the 'Triggered when' section to view the trigger options.
![Get Webhook Endpoint](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/jF_CA6f6453WAWQQ_a8T6.Screenshot-2024-04-24-at-00.08.37.png "Get Wehbook Endpoint")
3. **Retrieve the URL:** Find and click the blue button labeled 'Get the link'. This action will display the URL, which will look something like this:

   ```
   https://api.studio.prisme.ai/v2/workspaces/YOUR-WorkspaceID/webhooks/Your-automation-slug
   ```

This URL serves as the endpoint for your automation, enabling external systems to call it directly. You can copy this URL and configure it as a webhook in your CRM, email system, ERP, or any other relevant external service to trigger this automation automatically.


### Custom Code Configuration

Custom Code is configured to clean and structure incoming data before it's processed by AI. This setup showcases the seamless integration of data preprocessing with AI enhancements.
Learn more about [Code](https://docs.eda.prisme.ai/en/workspaces/code/).


```yaml title="Custom Code configuration"
appName: Custom Code
slug: Custom Code
config:
  functions:
    CleanData:
      code: |-
        return [
          {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "isActive": true,
            "roles": ["admin", "user"]
          },
          {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "isActive": false,
            "roles": ["user"]
          }
        ];
```
In the above configuration of the Custom Code, the function CleanData awaits no parameter and always return the same data (as a JSON format). 

### Using HTTP variables

For the moment the data is generated by our Custom Code application, this is interesting for learning purpose but has no real practical value for production environment. 
Let's see how we can use data received by the webhook within our automation.   

All **HTTP variables** are **available** at the **root level** inside your endpoint automation. 
We can directly use variables such as : **query**, **body**, **headers**, **method**.  
  
!!! tip "How?"

    [Learn more about why those variables are available.](../workspaces/automations.md#url)

You might have noticed it while creating the webhook automation: we are passing the `headers` and the possible `body` in the `payload` of the `summary-event`.

#### Variables to the Custom Code
If you wish to use a variable inside a Custom Code, you will have to declare it as a parameter of the given function.

You can even give default values to this variable, here is the new configuration:

```yaml title="Custom Code configuration" hl_lines="7-26"
appName: Custom Code
slug: Custom Code
config:
  functions:
    CleanData:
      code: |-
        return data;
      parameters:
        data:
          type: object
          default: [
              {
                "id": 1,
                "name": "John Doe",
                "email": "john.doe@example.com",
                "isActive": true,
                "roles": ["admin", "user"]
              },
              {
                "id": 2,
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "isActive": false,
                "roles": ["user"]
              }
            ]
```

Notice that we added a parameter named `data`, this parameter is an `object` (JSON) and have a default value.

After saving this configuration, you can try again your automation, nothing should have changed as the default value is used.

In order for the function call to receive the parameters we will have to add it in the automation call, as such : 

```yaml title="Webhook automation" hl_lines="6-7"
slug: webhook
name: Webhook
do:
  - Custom Code.run function:
      function: CleanData
      parameters:
        data: '{{query}}'
      output: cleanData
  - emit:
      payload:
        body: '{{body}}'
        headers: '{{headers}}'
        data: '{{cleanData}}'
      event: summary-event
when:
  endpoint: true
output:
  message: '{{cleanData}}'
```

In the above code we added a `data` parameter to the `Custom Code.run function` call, its value is the content of the `query` variable. 

You can now try to call your webhook with a query string, for example :

   ```
   https://api.studio.prisme.ai/v2/workspaces/YOUR-WorkspaceID/webhooks/Your-automation-slug?city=Toulouse&country=France
   ```

The assistant should make a summary about the following data : 
```json
{
  "city": "Toulouse",
  "country": "France"
}
```

## Version Control and Deployment

Version control is a crucial component in managing your automations over time, allowing you to maintain a history of changes and revert to previous versions if needed. Deployment practices ensure that your live environment is updated safely without disrupting existing functionalities.

### Implementing Version Control

1. **Creating Versions:** Use the Prisme.ai interface to create and manage versions of your workspace. This allows you to save stable configurations of your automations and revert to them if required.

2. **Version Deployment:** Deploy specific versions to production by selecting them in the workspace settings. This helps in managing which version is currently active and ensures that only tested and approved changes are made live.

3. **Change Management:** Track changes between versions. This is useful for auditing and understanding modifications, helping you manage the development lifecycle of your automations effectively.

![Pull](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/v-bucRV/MRLovKFBFrNffCOz6gecZ.Screenshot-2024-04-09-at-23.15.59.png "Pull")
Learn more about [Version Control](https://docs.eda.prisme.ai/en/workspaces/versioning/) and [RBAC](https://docs.eda.prisme.ai/en/workspaces/security/) to manage access and permissions.

### Best Practices for Deployment

- **Test in Staging:** Always deploy your changes to a staging environment first. Test thoroughly to ensure everything works as expected before deploying to production.
- **Scheduled Deployments:** Plan your deployments during off-peak hours to minimize the impact on end users.
- **Monitor Deployments:** Keep an eye on the system’s performance and functionality immediately after a deployment to catch and rectify any unforeseen issues quickly.

## Logs and Activity Monitoring

Monitoring activities and logging are essential for troubleshooting and ensuring that your applications are running smoothly. Prisme.ai provides tools to monitor the activities related to your automations and API usage.

### Setting Up Monitoring

1. **Activity Logs:** Access the activity logs in your Prisme.ai dashboard to view detailed records of operations, such as API calls, automation triggers, and system messages. These logs are invaluable for debugging and understanding the behavior of your automations.

2. **Real-Time Monitoring:** Utilize real-time monitoring tools provided by Prisme.ai to observe the live activity within your workspace. This can help in quickly identifying and responding to operational issues.

3. **Alerts and Notifications:** Set up alerts for critical events or errors in your automations. Prisme.ai can send notifications to your email or a designated messaging platform to keep you informed of significant activities or system issues.

### Analyzing Logs for Insights

- **Performance Analysis:** Use logs to analyze the performance of your automations. Look for patterns that might indicate bottlenecks or inefficiencies.
- **Error Identification:** Regularly review error logs to identify common issues or recurring problems that need addressing to improve the reliability of your automations.
- **User Activity Tracking:** Monitoring user activities through logs can help in understanding how your applications are used and identifying potential improvements.

![Activity](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/v-bucRV/uAEBlLFKqTJBUTVAUV7Nu.Screenshot-2024-04-09-at-23.16.55.png "Activity")

By incorporating version control, deployment strategies, and effective monitoring of logs and activities, you ensure that your Prisme.ai workspace not only runs efficiently but also adapts and evolves reliably over time. These practices are key to maintaining a robust, scalable, and secure automated environment.

## What We've Learned

- **API Integration**: Setting up endpoints to handle incoming data through Webhooks.
- **Data Processing**: Utilizing Custom Code to preprocess data without the overhead of managing a database.
- **AI Utilization**: Leveraging AI to enhance data with valuable insights, such as summarizing content.
- **Seamless Interactions**: Creating workflows that integrate data processing and AI functionalities smoothly.

## Conclusion

By completing this tutorial, you have learned how to efficiently combine APIs, Webhooks, and AI to create powerful automations within Prisme.ai. This approach not only simplifies backend processes but also enhances data utility, making it more accessible and actionable.

Explore further possibilities with Prisme.ai and Generative AI to revolutionize your application workflows. This setup forms a foundation that can be adapted and expanded to fit a wide range of applications, paving the way for innovative solutions in your projects.