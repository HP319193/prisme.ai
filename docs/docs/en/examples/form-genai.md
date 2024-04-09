
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

1. In your workspace, find the option to create a new page. Click on it.
2. Name your page thoughtfully, for instance, "Contact Us Form". Assign a slug, such as `contact-us`, for easy web access.
3. Go to the form builder section and click on Add a Block
4. Search "Form" and click on it
5. A coté de Form Specification click on "+" 
    a. Fill Property Name with name (without space and specicial caracters) and Click on dropDown icon, then Field label, Description and placeholder
    b. A coté de Form Specification click on "+", then do same for email
    c. A coté de Form Specification click on "+", then do same for message, for this one choose text area as display mode
    d. A coté de Form Specification click on "+", then do same for attachement, for this one choose Sending  a file as display mode
6. Remplis le champ "On submit event" avec un nom d'événement de votre choix (Prisme.ai est une plateforme dite Event Drivent Architecture où les communications entre le front et le back peuvenet se faire uniquement par événement), par exemple formSubmit
7. Click on save, you can see your Form
     
    

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

## Step 5: Utilizing OpenAI for Gen.AI Routing

To automatically determine the nature of each inquiry, we'll use OpenAI.

### OpenAI Setup:

1. Install OpenAI from the marketplace and configure it within your workspace.
2. Create an automation that sends the form's `message` field to OpenAI, asking it to categorize the inquiry. Use the prompt format mentioned earlier.

## Step 6: Slack Integration for Real-Time Alerts

Receive instant notifications in Slack for every form submission and its categorization.

### Slack App Setup:

1. Install the Slack App and link it to your workspace.
2. Configure it to send a message to a specific channel summarizing the submission and its suggested routing.

## Step 7: Deploying Your Project

After configuring your project, it's time to deploy.

### Version Control and Deployment:

1. Test your setup thoroughly to ensure everything works as expected.
2. Create a version of your workspace. This makes your project live and allows for easy management and updates.

## Step 8: Monitoring and Optimization

Leverage Prisme.ai's logging tools to monitor your application's performance and optimize it over time.

### Logs and Activity Monitoring:

- Regularly review the logs to troubleshoot any issues and to understand user interactions better.

## Conclusion

By following this detailed guide, you've built a robust, AI-powered contact form on Prisme.ai that efficiently routes inquiries to the correct department. This system not only streamlines internal operations but also enhances responsiveness to customer needs.

Explore further possibilities with Prisme.ai and Generative AI to revolutionize your business processes. Remember, the provided steps can be adapted and expanded to fit a wide range of applications beyond contact form routing.

For more insights and to duplicate this workspace for your projects, visit studio.Prisme.ai. Embrace the future of business automation today!