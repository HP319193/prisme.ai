### What is an App on Prisme.ai?

On Prisme.ai, an "App" can be viewed as a collection of functionalities or integrations that extend the platform's capabilities to meet specific business needs. Apps can take several forms:

1. **Custom Blocks**: These are components built using ReactJS that you can integrate into the Prisme.ai environment to provide custom user interfaces or specialized functionalities.

2. **Integrations (Connectors)**: Apps can serve as connectors to various external services, such as CRMs, other software, or APIs. This enables Prisme.ai to interact directly with these services, facilitating data exchange and automating workflows.

3. **Code to No-Code Interface**: An app can also transform complex code into a user-friendly no-code interface, making it easier for non-technical users to interact with and utilize backend systems.

4. **Legacy to Modern API**: Convert legacy software systems into modern APIs through apps, enhancing their integration with contemporary systems and improving their overall utility and scalability.

### Benefits of Creating Custom Apps on Prisme.ai

Creating custom apps on Prisme.ai offers significant advantages:

- **Accelerated Roadmap Execution**: Custom apps allow for quicker deployment of new features and integrations, speeding up project timelines and delivering value faster.

- **Enhanced Quality and Security**: By using a controlled building environment, apps can be thoroughly tested and secured before deployment, reducing the risk of errors and vulnerabilities.

- **Governance and Control**: Prisme.ai provides governance features that restrict app building to authorized users such as developers, senior architects, or data engineers. This helps in maintaining high standards and ensuring that only approved changes are implemented.

- **Increased Productivity**: By automating routine tasks and integrating various data sources and services, custom apps can significantly boost productivity. They allow users to focus on more strategic activities by reducing manual efforts.

- **Reusable Components**: Once built, these apps or components can be reused across different projects within the organization, saving time and resources in the long run.

By building custom apps, businesses can tailor the Prisme.ai platform to their specific requirements, ensuring that their technological solutions are as effective and efficient as possible.

Below is a step-by-step tutorial on how to build and deploy an application on Prisme.ai App Store, using Mailjet as an example.

## Tutorial: Building and Deploying a Mailjet App on Prisme.ai

### Prerequisites

- Active Prisme.ai account.
- Basic knowledge of YAML
- API credentials from Mailjet.

### Step-by-Step Guide

#### Step 1: Create a Workspace for Mailjet

1. **Name Your Workspace**: Start by naming your workspace 'Mailjet'.
2. **Description and Icon**: Add a brief description and choose an icon that represents the Mailjet service.

#### Step 2: Build Automation

1. **Create an Automation**: Define an automation named "SendEmail". 
2. Copy/past this YAML on the "See Code" menu to configure your automation.

```yaml
slug: send-email
name: SendMail
do:
  - fetch:
      emitErrors: true
      outputMode: body
      headers:
        Content-Type: application/json
        Authorization: Basic [Base64 Encoded Credentials]
      query: {}
      url: https://api.mailjet.com/v3.1/send
      method: post
      body:
        Messages:
          - From:
              Email: '{{fromEmail}}'
              Name: '{{fromName}}'
            To:
              - Email: '{{toEmail}}'
                Name: '{{toName}}'
            Subject: '{{subject}}'
            TextPart: '{{body}}'
      output: response
arguments:
  fromEmail:
    type: string
    placeholder: john@example.com
    title: 
     fr: From Email
     en: From Email
    description: 
     en: From Email
     fr: From Email
  fromName:
    type: string
    placeholder: john
    title:
      en: From name
      fr: From Name
  toEmail:
    type: string
    placeholder: john@example.com
    title: 
     fr: To Email
     en: To Email
    description: 
     en: To Email
     fr: To Email
  toName:
    type: string
    placeholder: john
    title:
      en: To name
      fr: To Name
  subject:
    type: string
    placeholder: Your first Email
    title: 
     fr: Object
     en: Subject
    description: 
     en: Subject
     fr: Object
  body:
    type: string
    ui:widget: html
    title: 
     fr: Corps
     en: Body
    description:
      fr: Texte ou contenu enrichi au format HTML ou Markdown
      en: Text or rich text formated with HTML ou Markdown 
```

As you can see, this YAML  defines a workflow named `SendMail`, with a unique identifier `slug` of `send-email`. The workflow involves sending an email through the Mailjet API (version 3.1) by executing an HTTP POST request. Here's a detailed breakdown of the script's sections:

##### Workflow Configuration
- **slug:** `send-email` - This is a unique identifier for the workflow.
- **name:** `SendMail` - The name of the workflow.

##### Actions
The workflow consists of one main action (`fetch`), which configures and sends the HTTP POST request:

- **emitErrors:** `true` - If the action encounters errors, it emits them.
- **outputMode:** `body` - The output will include the response body from the HTTP request.
- **headers:** 
  - `Content-Type: application/json` - Specifies that the request body is JSON.
  - `Authorization: Basic [Base64 Encoded Credentials]` - Uses basic authentication with credentials encoded in Base64.
- **query:** `{}` - An empty object indicates no query parameters are sent with the request.
- **url:** `https://api.mailjet.com/v3.1/send` - The endpoint for the Mailjet API to send emails.
- **method:** `post` - Specifies the HTTP method as POST.
- **body:** - Contains the data sent in the request body, structured to match Mailjet's required format for sending emails:
  - `Messages`: List containing the email message details.
    - `From`: Sender's email and name.
    - `To`: Recipient's email and name.
    - `Subject`: Subject of the email.
    - `TextPart`: Plain text part of the email.
- **output:** `response` - The response from the API will be stored in `response`.

##### Arguments
These are placeholders for dynamic input values that will be used in the `body` of the request:

- **fromEmail, fromName, toEmail, toName, subject, body:**
  - Each of these arguments is of type `string`.
  - They come with a placeholder to suggest example values.
  - Bilingual titles and descriptions (`en` for English and `fr` for French) define what each field represents and guide the user on what to input.
  - **body:** has an additional property `ui:widget` set to `html`, indicating that the input for this field should allow HTML content, enabling the sender to format the body of the email with HTML or Markdown.

![Arguments](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/O_7pI8uh00gKy3-V5ychV.Screenshot-2024-05-13-at-22.59.08.png "Arguments")

**Configure Privacy Settings**: To ensure confidentiality, set this automation to private by enabling the `private: true` setting. This configuration will restrict visibility, preventing Workspace consumers from accessing the automation.


#### Step 3: Version and Push Your Workspace

1. Test your setup thoroughly to ensure everything works as expected.
2. Navigate to your workspace settings, click on "Push" to create a new version. This action automatically archives the current state, facilitating easy updates or rollbacks.

![Pull](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/v-bucRV/MRLovKFBFrNffCOz6gecZ.Screenshot-2024-04-09-at-23.15.59.png "Pull")
Learn more about [Version Control](https://docs.eda.prisme.ai/en/workspaces/versioning/) and [RBAC](https://docs.eda.prisme.ai/en/workspaces/security/) to manage access and permissons.


#### Step 4: Publish the Workspace as an App

**Publish**: After testing your configurations, publish the workspace as an App on Prisme.ai Apps Store. This makes the app available for others to install.
![Publish App](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/OHDnOjJXa2eUMOJZLDE8E.Screenshot-2024-05-13-at-23.21.48.png "Publish App")

#### Step 5: Install and Use the App
1. **Install Mailjet App**: In a new or existing workspace, install the Mailjet app.
2. **Getting Started with 'SendEmail'**: Incorporate the 'SendEmail' instruction into your automation. Begin by creating a new automation in your workspace. Once you're in the automation editor, click on the "+" icon to add a new instruction. Search for and select the 'SendEmail' action, which is associated with Mailjet. This enables you to review and manage all previously defined arguments, ensuring that the data structure is correctly configured for optimal control and efficiency.

### Advanced Configuration and Documentation

#### Step 1: Set Configuration
1. **base64_encoded_credentials**: Navigate to the configuration settings of your workspace Mailjet
![Config Workspace](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/g9bmW584z5Cy8eJw_nW9F.Screenshot-2024-05-13-at-23.35.47.png "Config Workspac")

2. Add this configuration to your existing YAML field

```yaml
config:
  schema:
    base64_encoded_credentials:
      title: Base64 encoded credentials
      description: Base64 encoded credentials
      type: string
```
#### Step 2: Create Documentation Page
1. Create a page with a slug `_doc` and ensure the app is set to public to allow user access to documentation.
![Public App](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/v8FIAgEm8u-3R1mtK5iZ-.Screenshot-2024-05-13-at-23.38.20.png "Public App")

2. Copy/past this YAML (click on See code section)

```yaml
slug: _doc
name:
  fr: Documentation
  en: Documentation
blocks:
  - slug: RichText
    content: |-
      <h1>Mailjet</h1> 
      <p>
        The complete solution to power your email
      </p><br />
  - slug: TabsView
    tabs:
      - type: event
        content:
          blocks:
            - slug: RichText
              content: |- 
                <hr />
                <p>Hello World</p>          
        text: Documentation
      - type: external
        text: Changelog
        content:
          blocks:
            - slug: RichText
              content: |-
                <hr />
                 <h2>3-8-2023.3</h2>  
                 <p> Latest stable release</p>
styles: |-
  .page-blocks {
    padding: 2rem;
  }
```

#### Step 3: Publish New Version
1. Push a new version of your workspace.
2. Publish a new version of your app.

#### Step 4: Review Changes and Configuration
1. Return to your workspace where the Mailjet app is installed. 
2. Click on Mailjet on the Apps section. You should now see a configuration tab and documentation available

![App with config](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/zDIzJgZ/pATbpXwE_KFdc2J3bLnO3.Screenshot-2024-05-13-at-23.42.55.png "App with config")

### Monitoring and Logs

1. **Logs**: Access logs on the Activity tab  to monitor the app’s usage and performance.
2. **Monitoring**: Set up monitoring to ensure the app runs smoothly and efficiently.

### Conclusion

By following these steps, you can successfully create a customized application on Prisme.ai, integrating services like Mailjet. This approach accelerates roadmap execution, ensures quality, and enhances security while providing governance features to manage development and deployment effectively.