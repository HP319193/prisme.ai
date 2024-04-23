# Efficient Document Handling with AI on Prisme.ai

This tutorial will guide you through setting up a robust document management system on Prisme.ai, utilizing the power of Generative AI to classify documents into categories such as invoices, CVs, quotes, contracts, and others. This system simplifies the process of managing, storing, and retrieving documents, enhancing organizational efficiency.

## Prerequisites

- Active account on Prisme.ai.
- Access to OpenAI Azure and the Collection app installed in your workspace.

## Step 1: Setting Up Your Workspace on Prisme.ai

Begin by logging into Prisme.ai and navigating to the Builder product to initiate a new workspace specifically for document management.

### Workspace Creation:

1. Click on the "Create Workspace" button.
2. Name your workspace to reflect its purpose, such as "Document Management System."
3. Select the necessary settings for your project.

## Step 2: Creating a Document Upload Page

This step involves setting up a page within your workspace where users can upload documents to be automatically classified by AI.

### Page Setup:

#### Creating a Document Upload Form on Prisme.ai

This form acts as the entry point for document submissions into your system.

#### 1. Initiating a New Page:

1. Within your workspace, navigate to the section where you can manage or create new pages.
2. Click on "Create a New Page" and begin customizing the user experience.

#### 2. Naming and Setting Up Your Page:

1. Give your page a meaningful name like "Document Upload Form."
2. Assign a slug, e.g., `upload-docs`, which will be used in the page's URL path.

#### 3. Building the Form:

1. Locate the form builder section within your page settings.
2. Click on "Add a Block" and search for "Form" to add it to your page.

#### 4. Configuring Form Specifications:

1. Add fields for document upload and description:
   - **For Document Field:**
     - Add a new field with the property name `attachment`, set to allow file uploads, specifically `.pdf` files.
   - **For Description Field:**
     - Add a "Description" field as a text area for users to describe the document content.

![Configuring Form Specifications](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/v-bucRV/hvuw0rAKUvfPfgxCmb3SV.Screenshot-2024-04-09-at-23.13.26.png "Configuring Form Specifications")

```yaml
slug: upload-docs
name: Document Upload Form
blocks:
  - slug: Form
    schema:
      type: object
      properties:
        attachment:
          type: string
          ui:widget: upload
          title: Document Upload
          description: Attach your document here.
          ui:options:
            upload:
              accept: .pdf
        description:
          type: textarea
          title: Document Description
          placeholder: Describe the document here.
    onSubmit: save
```

#### 5. Displaying Data Table:

1. Add a DataTable block to show the uploaded documents along with their classified categories.
2. Configure columns for ID, description, category, and actions such as delete.

```yaml
  - slug: DataTable
    columns:
      - label: ID
        key: id
        type: string
      - label: Description
        key: description
        type: string
      - label: Category
        key: category
        type: string
      - label: Actions
        actions:
          - label: Delete
            action:
              type: event
              value: deleteData
              payload:
                id: ${id}
    config:
      customProps:
        loading: true
      title:
        fr: Uploaded Documents
        en: Uploaded Documents
    data:
      - {}
```

3. Obtain the URL for your page; each page follows the format: `workspace-slug.host-page/lang/page-slug`.  To find it, click on the share icon located between the page name and the "duplicate" action. If you've named your slug "index," access it directly via `workspace-slug.host-page`.

![Get page URL](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/v-bucRV/vf0ff52bWJ7p5MDxBrfyU.Screenshot-2024-04-09-at-23.14.58.png "Get page URL")

## Step 3: Automating Document Classification

Set up an automation within Prisme.ai that triggers upon document upload to classify the document using AI.

### Event Listening automations:

1. Navigate to the "Automations" section of your workspace.
2. Create a new automation named "Document Classification Handler".
3. Configure this automation to use OpenAI Azure for categorizing the documents based on the description provided during upload.

![Automation builder](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/v-bucRV/x-AogVtqhSNar9EuVQQQW.Screenshot-2024-04-09-at-23.14.16.png "Automation builder")

```yaml
slug: manage-form
name: Manage Form
do:
  - OpenAI.chat-completion:
      stream:
        options:
          persist: true
      model: gpt-3.5-turbo
      messages:
        - role: system
          content: 'Classify the document within these categories: invoice, CV, quote, contract, others. Provide your categorization based on the content.'
        - role: user
          content: '{{payload.description}}'
      output: data
  - conditions:
      '{{data.choices[0].message.content}}':
        - set:
            name: payload.category
            value: '{{data.choices[0].message.content}}'
            type: merge
      default:
        - emit:
            target:
              currentSocket: true
            options:
              persist: true
            event: error
            payload: '{{data}}'
        - set:
            name: payload.error
            value: '{{data.error.message}}'
            type: merge
  - Collection.insert:
      data: '{{payload}}
  - emit:
      target:
        currentSocket: true
      options:
        persist: false
      event: initData
when:
  events:
    - save
output: '{{payload}}'
```


### Automation for Retrieving Data

This automation ensures that the latest data is always displayed on your DataTable after any operation, such as uploads or deletions.

#### Retrieving Data Automation Setup:

1. **Set up a new automation** within the "Automations" section called "Get Data".
2. Configure this automation to fetch all documents from the collection and emit an event to update the data table on the front end.

```yaml
slug: get-data
name: Get Data
do:
  - Collection.find:
      query: {}
      output: data      
      sort:
        createdAt: -1        
  - emit:
      event: updateData
      payload:
        data: '{{data}}'
        customProps:
          loading: false  
when:
  events:
    - initData   
output: ''               
```

### Automation for Deleting Data

This automation will handle requests to delete documents from your system, ensuring that data management remains streamlined and secure.

#### Deleting Data Automation Setup:

1. **Navigate to the "Automations" section** of your workspace.
2. **Create a new automation** named "Delete Data".
3. Set up the automation to listen for the `deleteData` event and execute a deletion from your document collection.

```yaml
slug: deleteData
name: Delete Data
do:
  - conditions:
      '!{{payload.data._id}}':
        - break: {}            
      default: []
  - Collection.deleteOne:
      query:
        _id: '{{payload.data._id}}'
  - emit:
      target:
        currentSocket: true
      options:
        persist: true
      event: initData   
when:
  events:
    - deleteData
output: ''
```

### Version Control and Deployment:

1. After setting up, pull the latest changes and create a version for easy updates or rollbacks.

![Pull](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/v-bucRV/MRLovKFBFrNffCOz6gecZ.Screenshot-2024-04-09-at-23.15.59.png "Pull")
Learn more about [Version Control](https://docs.eda.prisme.ai/en/workspaces/versioning/) and [RBAC](https://docs.eda.prisme.ai/en/workspaces/security/) to manage access and permissons.

## Step 4: Monitoring and Optimization

Regularly check the activity log in Prisme.ai to monitor actions from form submissions to document classification.

![Activity](https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/v-bucRV/uAEBlLFKqTJBUTVAUV7Nu.Screenshot-2024-04-09-at-23.16.55.png "Activity")

## Conclusion

By following this guide, you've set up a sophisticated AI-powered document management system on Prisme.ai that categorizes documents efficiently, improving your organization's document handling capabilities.

Explore further enhancements and adaptations for broader applications using Prisme.ai. This setup is just the beginning of transforming your business processes into more intelligent and automated operations.