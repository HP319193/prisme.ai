# Prisme.ai Platform Installation Functionality Testing Guide

1. **Account Management**

   - Create an Account:
     - Go to the Prisme.ai registration page.
     - Fill in the required information (name, email, password, etc.).
     - Ensure the new account is created successfully.

   - Login:
     - Go to the Prisme.ai login page.
     - Use the credentials of the newly created account to log in.
     - Verify that you can access the Prisme.ai platform after logging in.

   - Logout:
     - Ensure you can successfully log out of your account.

2. **Page Builder**

   - Create a Simple Page:
     - Access the Interfaces Builder.
     - Create a new page.
     - Add a simple text block to the page.
     - Verify that the page is created successfully and the text block is displayed correctly.

   - Create a Page with a Form Block:
     - Access the Interfaces Builder.
     - Create a new page.
     - Add a Form block to the page and define a custom event.
     - Copy the URL of the page.
     - Open a browser and paste the URL to view the page.
     - Fill in the form and submit it.
     - Verify that the custom event is emitted correctly.

3. **Automation Builder**

   - Create a Simple Automation:
     - Access the Automation Builder.
     - Create a new automation that returns "Hello World."
     - Launch the automation and ensure it runs successfully.

   - Create a Simple API Automation:
     - Access the Automation Builder.
     - Create a new automation that returns "Hello World."
     - Check the "accessible by URL" option for the automation.
     - Click on the generated endpoint to copy the URL.
     - Paste the URL into a browser and verify that it returns "Hello World."

4. **Workspace Management**
   - Install an Application from Prisme.ai Apps Store:
     - Go to the Prisme.ai Apps Store.
     - Choose a Custom Code application and install it.
     - Verify that the application is installed successfully.
     - Add a simple function to the application that returns "Hello World."
     - Uninstall the application and ensure the uninstallation is successful.

5. **Workspace Management**

   - Reconnect:
     - Ensure you can log back into your account after installing and uninstalling the application.

   - Share the Workspace:
     - Try sharing the workspace you have created with another user.

   - Create a New Workspace and Share the Page with Another User:
     - Create a new workspace.
     - Try sharing the page you have created with another user.
     - Verify that the other user can access the page but not the entire workspace.

   - Workspace Settings:
     - Go to the workspace settings.
     - Modify the name, description, and add a logo to your workspace.

   - Create a Version for Your Workspace:
     - Go to the workspace settings and add a version.
     - Ensure the version is created successfully.

6. **Test Activity (Audit Log)**

   - Check Activity Logs:
     - Go to the Activity (Audit Log) of your Workspace.
     - Verify that all the operations you have performed are logged with associated data.
     - Filter specific events, such as workspace sharing, version creation, errors, events from the created form, etc.

7. **Test Rollback**

   - Test Rollback Functionality:
     - On the workspace where you have created a version, add an additional automation.
     - Go to Activity (Audit Log) and filter for created versions.
     - Verify that you have the option to rollback.
     - Perform a rollback and verify that the previously added automation has disappeared.

8. **Verify Code**

   - Access each page/automation/Apps and verify that you have access to the YAML code for each.
   - The YAML code describes your page/automation/Apps.
   - You can edit it and verify that the no-code part changes as well.

9. **Logout**

   - Ensure you can successfully log out of your account.

Please make sure to follow the steps of each task and note the results obtained as well as any issues encountered during the tests. This information will be useful for improving and addressing any potential problems on the Prisme.ai platform. Good luck with your tests!
