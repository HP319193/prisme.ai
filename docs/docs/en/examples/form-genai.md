
# Advanced Contact Form Automation with Prisme.ai

This  tutorial will guide you through creating a Gen.AI contact form on Prisme.ai. This form intelligently routes submissions to the appropriate department within your organization, be it support, sales, or careers, leveraging the power of Generative AI to enhance operational efficiency and scalability.

## Prerequisites

- Active account on Prisme.ai.
- Access to OpenAI, and Slack applications (optional)

## Step 1: Setting Up Your Workspace on Prisme.ai

First, log into Prisme.ai. Navigate to the Builder product to initiate a new workspace. This workspace acts as a central hub for your project, facilitating resource organization and automation management.

### Workspace Creation:

1. Click on the "Create Workspace" button.
2. Enter a name for your workspace that reflects its purpose, e.g., "AI Contact Routing", a short description and an icon
3. Select the appropriate settings according to your project's needs.

## Step 2: Creating and Configuring the Contact Page

Now, let's create a page within your workspace that hosts our intelligent contact form.

### Page Setup:

### Creating a Contact Us Page and Form on Prisme.ai

Creating a dynamic contact form on Prisme.ai involves a straightforward yet powerful process. This form will be the bridge between your customers and your team, enabling an organized flow of information.

#### 1. Initiating a New Page:

1. Within your Prisme.ai workspace, navigate to the section where you can manage or create new pages.
2. Click on the option to create a new page. This is your first step towards customizing the user experience on your platform.

#### 2. Naming and Setting Up Your Page:

1. Provide your page with a meaningful name that clearly indicates its purpose. For example, naming it "Contact Us Form" will make it easily identifiable.
2. Assign a slug to your page, such as `contact-us`. This slug is crucial as it defines the page's URL path, making it accessible and memorably linked to its function.

#### 3. Building the Form:

1. Locate the form builder section within your page settings. Here, you're about to construct the backbone of your contact mechanism.
2. Click on "Add a Block" to begin adding elements to your page. In the search bar that appears, type "Form" and select the form block to add it to your page.

#### 4. Configuring Form Specifications:

1. Next to the "Form Specification" section, you'll see a "+" button. Click this to start adding fields to your form.
   - **For Name Field:**
     - Click the "+" to add a new field.
     - In "Property Name", input `name`. Ensure there are no spaces or special characters.
     - Click on the dropdown icon to set the Field label, Description, and Placeholder. These help guide the user when filling out the form.
   - **For Email Field:**
     - Repeat the process to add another field, this time with the property name `email`, setting up its label, description, and placeholder similarly.
   - **For Message Field:**
     - Add a new field with the property name `message`. When setting its display options, choose "Text Area" to allow for longer messages.
   - **For Attachment Field:**
     - Lastly, add a field for attachments with the property name `attachment`. Choose "Sending a File" as its display mode to enable file uploads.

#### 5. Setting Up Form Submission Event:

1. Fill in the "On submit event" field with an event name of your choice. Prisme.ai operates on an Event-Driven Architecture, meaning front-end to back-end communications are facilitated through events. A suggested name could be `formSubmit`. This event name will be crucial for setting up automations and integrations later.

#### 6. Saving Your Form:

1. After configuring your form, click on "Save". You'll now be able to view your form as it will appear to users. This is a good moment to review and make any necessary adjustments to ensure clarity and usability.

This enhanced setup guide provides a detailed walk-through for creating a contact form in Prisme.ai, emphasizing clarity and user engagement. By following these steps, you'll establish a straightforward, efficient channel for receiving and managing customer inquiries and requests.

    

### YAML Configuration:

- Use See code Section to see and edit the YAML that defines each field's properties, ensuring proper data capture and structure. You can see that it looks like :

```yaml
slug: contact-us
name: Contact Us Form
blocks:
  - slug: Form
    schema:
      type: object
      properties:
        name:
          type: string
          title: Name
          description: Fill your first name please
          placeholder: John doe
        message:
          type: string
          title: Message
          description: Fill your message
          placeholder: your message
          ui:widget: textarea
        email:
          type: string
          placeholder: john.doe@example.com
          description: your email
        attachement:
          type: string
          ui:widget: upload
          title: Attachement
          description: Attach a file if needed
          placeholder: Your file
    onSubmit: formSubmit
```


## Step 3: Automating Form Submission Handling

Create an automation within Prisme.ai that triggers upon form submission, parsing the form data and any attachments.

### Event Listening Automation:

1. Navigate to the "Automations" section of your workspace.
2. Create a new automation named "Form Submission Handler". Assign a slug, such as `form-sbmission-handler`, for easy web access.
3. Use the event trigger feature to activate this automation whenever the contact form is submitted. To do this, fill event with "formSubmit" choosen before on the Form Block. 

### Integrating SendMail for Email Notifications

To ensure timely follow-ups on each contact form submission, we'll utilize the SendMail app from Prisme.ai's App Store for automated email notifications.

#### 1. Installing SendMail:

1. Navigate to the Prisme.ai App Store by clicking on the "Apps" section in your workspace dashboard.
2. Look for the "+" button within the "Apps" section. This is your gateway to exploring the available applications.
3. Use the search bar to find "SendMail". Once located, click on the app's name to add it to your workspace.

#### 2. Configuring SendMail in Your Automation:

Once SendMail is installed, you need to incorporate it into your form submission handling process for automated email dispatch.

1. Return to your workspace and open the "Automations" section. Find the "Form Submission Handler" automation that you previously set up.
2. Add a new action to this automation by selecting "Add Instruction" and choose "SendMail" from the list of available actions.
3. You will now configure the SendMail action to dynamically use the form submission data to send an email. Fill in the configuration fields as follows:
   - **To:** Enter `youremail@example.com` as the recipient address where all form submission notifications will be sent.
   - **From:** Use the dynamic field `{{payload.email}}` to automatically insert the submitter's email address. This adds a personal touch and allows for direct replies.
   - **Subject:** Create a subject line that will help you quickly identify the email's purpose. For example, "New Contact Form Submission".
   - **Body:** Here, you'll include the main content of the form submission. Utilize the dynamic fields to insert the submitter's message, name, and any attachments they've included. Structure it like so: `"Message: {{payload.message}}, Name: {{payload.name}}, Attachment: {{payload.attachment}}"`.

This configuration not only automates email notifications upon each form submission but also ensures that you receive detailed insights into each inquiry directly in your inbox, facilitating a prompt and personalized response.

To ensure timely follow-ups on each contact form submission, we'll utilize the SendMail app from Prisme.ai's App Store for automated email notifications.

Let's enhance the instructions for integrating OpenAI to facilitate intelligent routing of inquiries within your Prisme.ai setup, ensuring clarity and an efficient setup process.

### Step 5: Implementing OpenAI for Gen.AI Inquiry Routing

Harness the capabilities of Gen.AI to assess and route inquiries automatically, ensuring each is directed to the appropriate department based on content analysis.

#### OpenAI App Integration:

1. **Installation and Configuration:**
   - Navigate to the Prisme.ai App Store and locate the OpenAI App.
   - Install the OpenAI App following the same installation process as previous apps. Once installed, configure it within your workspace by entering your OpenAI API Key. This key links Prisme.ai to your OpenAI account, enabling AI-powered functionalities.

2. **Setting Up Initial Variables:**
   - In your "Form Submission Handler" automation, add a new instruction named "Set var". This will define a default recipient email. For the variable name, enter `recipient`, and for its value, use a placeholder email such as `hello@example.com`. This is a preliminary setup before dynamic routing is applied.

#### Configuring OpenAI Chat Completion:

1. **Preparing Chat Completion:**
   - Before the SendMail instruction in your automation, add a "Chat Completion" instruction to initiate communication with OpenAI.
   - Click "+" next to Messages to add a new message. Set the role to `System` and fill in the prompt with the context or instruction for OpenAI, guiding it on how to analyze the incoming message.

2. **Capturing User Inquiry:**
   - Again, click "+" next to Messages to add another message. This time, set the role to `User` and use `{{payload.message}}` as the prompt content. This ensures the user's actual inquiry from the form submission is fed into OpenAI for analysis.

3. **Processing OpenAI Response:**
   - In "Assign the output to the variable", input a variable name that will hold OpenAI's response, such as `result`. This captures the AI's interpretation and suggestion based on the inquiry.

4. **Extracting Relevant Content:**
   - Add another "Set var" instruction to extract the message content from OpenAI's response, setting its value to `{{result.choices[0].message.content}}`. Use a descriptive variable name like `routingDecision` for clarity.

#### Dynamic Routing Based on AI Analysis:

1. **Implementing Conditional Routing:**
   - Introduce a "Condition" instruction to evaluate the content of `routingDecision`. This step determines the nature of the inquiry (sales, support, careers) based on OpenAI's analysis.
   - For each condition (`{{routingDecision}} = "sales"`, `{{routingDecision}} = "support"`, `{{routingDecision}} = "careers"`), add a corresponding "Set var" instruction to update the `recipient` variable with the appropriate departmental email (e.g., `sales@example.com`, `support@example.com`, `careers@example.com`).

2. **Updating Email Recipient:**
   - Modify the existing SendMail instruction to dynamically use the `{{recipient}}` variable as the **To:** field. This ensures that each inquiry is automatically routed to the correct departmental email based on the analysis performed by OpenAI.

#### Finalization:

- Once configured, save your automation. Test it thoroughly with various inquiries to ensure accurate routing. This setup leverages AI's powerful analysis capabilities to enhance the efficiency of handling contact form submissions, directing them to the appropriate department within your organization seamlessly.


### Version Control and Deployment:

1. Test your setup thoroughly to ensure everything works as expected.
2. Navigate to your workspace settings, click on "Pull" to create a new version. This action automatically archives the current state, facilitating easy updates or rollbacks.

## Step 8: Monitoring and Optimization

Access the activity log in Prisme.ai to review all actions, from form submissions to event data and app installations. This comprehensive logging aids in debugging and auditing your setup.

### Logs and Activity Monitoring:

- Regularly review the logs to troubleshoot any issues and to understand user interactions better.

## Conclusion

By following this detailed guide, you've built a robust, AI-powered contact form on Prisme.ai that efficiently routes inquiries to the correct department. This system not only streamlines internal operations but also enhances responsiveness to customer needs.

Explore further possibilities with Prisme.ai and Generative AI to revolutionize your business processes. Remember, the provided steps can be adapted and expanded to fit a wide range of applications beyond contact form routing.

For more insights and to duplicate this workspace for your projects, visit studio.Prisme.ai. Embrace the future of business automation today!