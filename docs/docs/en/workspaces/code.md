# Custom Code: Flexibility in Automation

At Prisme.ai, we empower developers with the flexibility to create custom and complex automation tasks directly within their workspaces. By leveraging our Custom Code feature, developers can write and integrate bespoke functions in either Python or Node.js, depending on the specific needs and requirements of their automation flows.

!!! info "Access"

    This is an Enterprise Offer Feature
    You will need a valid Gitlab username and token in order to follow the next steps and be able to fetch the Docker images.  
    If you don't have them yet, please reach out to the support in order to retrieve them ([sales@prisme.ai](mailto:sales@prisme.ai)).   
    <!-- It should be a Gitlab Deploy Token -->

### Benefits of Using Custom Code

Utilizing Custom Code within Prisme.ai offers significant advantages:
- **Tailored Solutions:** Address specific business needs by implementing custom logic directly within your automation.
- **No Infrastructure Hassles:** Forget about the overheads related to infrastructure and hosting, as Prisme.ai handles these aspects seamlessly.
- **Flexibility and Control:** Choose between Python and Node.js to leverage the strengths of each language as per your use case.

Incorporating these capabilities into your work ensures that your automations are not only powerful and efficient but also customized to meet the exact needs of your enterprise.

### Getting Started with Custom Code

To begin utilizing Custom Code in your workspace, follow these simple steps:

1. **Install Custom Code:** Add the Custom Code capability to your workspace through the platform interface.

2. **Write Your Function:**

   - **Node.js Functions:** You can write your function in Node.js and import external libraries as required to extend functionality.

   - **Python Functions:** Python functions can be authored using a predefined set of libraries. While external library imports are not supported for Python, the following libraries are available:
     ```plaintext
        python = ">=3.10,<3.12"
        requests = "==2.31.0"
        ipykernel = "==6.23.1"
        python-dotenv = "==1.0.0"
        pandas = ">=1.5,<1.6"
        aiohttp = "*"
        numpy = "*"
        dateparser = ">=1.1,<1.2"
        geopandas = ">=0.13,<0.14"
        tabulate = ">=0.9.0,<1.0"
        PyPDF2 = ">=3.0,<3.1"
        pdfminer = ">=20191125,<20191200"
        pdfplumber = ">=0.9,<0.10"
        matplotlib = ">=3.7,<3.8"
        fastapi = {extras = ["all"], version = "*"}
        python-json-logger = "*"
        aiofiles = "*"
        pyyaml = "*"
        openpyxl = "*"
        llama-index = "==0.10.4"
        llama-index-vector-stores-elasticsearch = "==0.1.2"
        llama-index-vector-stores-redis = "==0.1.1"
        llama-index-vector-stores-azurecosmosmongo = "==0.1.1"
        llama-index-vector-stores-mongodb = "==0.1.2"
        llama-index-embeddings-azure-openai = "==0.1.1"
        llama-index-embeddings-elasticsearch = "==0.1.1"
        llama-index-embeddings-openai = "==0.1.1"
        llama-index-llms-azure-openai = "==0.1.1"
        llama-index-llms-mistralai = "==0.1.1"
        llama-index-llms-openai-like = "==0.1.1"
        llama-index-llms-openai = "==0.1.1"
        python-pptx = "*"
        pymupdf = "1.24.0"
        llama-parse = "^0.4.0"
        langchain-community = "^0.0.32"
     ```
3. **Function Example:** Access the 'See Code' menu to view example codes, or use the visual editor to create or modify your functions. Below is an example of a simple data cleaning function written in Node.js:

   ```yaml
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
         parameters:
           data:
             type: string
   ```

### Integrating Custom Code into Automation

Once your custom function is ready, integrate it into your automation processes:

1. **Navigate to the Automation Section:** Select the automation workflow where the function should be applied.
2. **Add the Custom Function:** Use the 'Run Function' option to choose your custom function, set necessary parameters, and incorporate it into your workflow.
3. **Save Your Configuration:** Confirm your settings by saving the updated automation configuration.

### Sharing Code Within Your Company

Prisme.ai offers a streamlined way to share your code within your organization without exposing the source code. After you have completed coding in your workspace, you can publish your workspace as an App. This allows you to distribute your application internally while maintaining code privacy.

#### How to Publish and Share Your App

1. **Publish your workspace:** Once your coding is complete, publish your workspace as an App. This transforms your workspace into a reusable application.
2. **Access from new workspaces:** When you create a new workspace, you will find your newly published app in the Prisme.ai App Store.
3. **Installation by team members:** Your team members can install the app from the App Store. They will have access to all public automations associated with the app without needing access to the underlying source code.
4. **Maintain and Update seamlessly:** Any updates, including new features or bug fixes, can be published as a new version of your app. This update automatically propagates to all workspaces that have installed your app, unless they have specified a fixed version.

#### Execution and Access Control

When you share your app within your company, it's important to note that while other users can execute the shared automations, they do not have direct access to the workspace itself. This ensures that the execution of automations is possible without compromising the privacy and integrity of the development environment. This level of access control helps maintain a secure boundary around sensitive source code and configuration settings while still promoting operational efficiency through shared automated processes.

#### Maintenance Tips

- **Version Control:** Before publishing your app, consider creating a specific version. This allows for easier rollback if necessary, ensuring stable and reliable use of your application across your organization.

By using this approach, you ensure that your code is efficiently shared and maintained within your company, enhancing collaboration while securing intellectual property.

#### Write your first Custom Code

For a quicker setup, we recommend using the (API & Webhooks) template available in the Builder. Simply sign in and duplicate this template. Everything is pre-configured to help you get started swiftly.

Happy coding!
