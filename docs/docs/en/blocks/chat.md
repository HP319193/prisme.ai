# Dialog Box Block (Chat)

**1. Technical Objective:**
The "Dialog Box Block" is intended to facilitate interactive conversations within a user interface, mimicking a chat interface. It supports customizable visual and functional elements, including message styling, input configurations, and actions. This block can be used for customer support chats, interactive guides, or any application requiring user interaction through text.

**2. Field Descriptions and Explanations:**

**Example 2: Simple Dialog Box**

- **slug**: Identifier for the dialog box block.

- **display**: Visual customization for different aspects of the chat interface:

  - **submitButton**: Style for the message send button.

  - **sentMessages**: Styling for messages sent by the user.

  - **receivedMessages**: Styling for messages received from the system or another user.

  - **startAtTop**: Determines if the chat should start from the top of the container.

  - **avatar**: Styling for the chat avatar.

- **setup**: Configuration of the input area:

  - **input**: Settings for the message input box, including placeholder text and enabling state.

  - **event**: Event triggered when a message is sent.

- **onInit**: Event triggered when the dialog box is initialized.

- **updateOn**: Event to update the dialog box's state or content.

- **sectionId**: An identifier for a specific section of the dialog box, used for targeted updates or styling.

- **css**: Custom CSS to style the dialog box, enhancing the visual appeal and adapting to different screen sizes.

- **header**: Defines the text and icon displayed at the top of the dialog box.

**Example: Complex Dialog Box**

- **slug**: Identifier for the dialog box block.

- **setup**: Configuration settings for the input area:

  - **input**: Configurable options for user input, including placeholder text in multiple languages and additional features like file upload.

  - **event**: Specifies the event to be triggered when input is received.

  - **upload**: Configuration for file uploads, including expiration settings.

  - **payload**: Data to be included with each input event.

- **history**: Template or variable containing the historical chat data to be displayed upon initialization.

- **display**: Visual customization for the chat interface:

  - **submitButton**, **sentMessages**, **receivedMessages**: Styling options for different components of the chat interface.

  - **avatar**: Settings for the avatar's appearance.

**3. Yaml files ('see code' section on the Builder):**

**Example 2:**
```yaml
slug: Dialog Box.Dialog Box
display:
  submitButton:
    background: '#ff7900'
  sentMessages:
    text: '#ffffff'
    background: black
  receivedMessages:
    background: '#f4f4f4'
    text: '#12204F'
  startAtTop: true
  avatar:
    background: transparent
setup:
  input:
    placeholder: Message.
    enabled: true
    event: sendInput
onInit: startConversation
updateOn: updateDialogBox
sectionId: top-element
css: |-
  @import default;
  body {
    --color-accent: #E0762D;
    --color-accent-light: #80A4FF;
    ...
  }
header:
  text: My AI
  iconText: MA
```
This configuration details a simple dialog box with specified colors for sent and received messages, an avatar setup, and custom CSS for overall styling. It is ready to handle basic chats, with a clear initialization and update mechanism.

**Example: Complex Dialog Box**
```yaml
slug: Dialog Box.Dialog Box
setup:
  input:
    enabled: true
    placeholder:
      fr: Message
      en: Message
    event: sendInput
    upload:
      expiresAfter: 3600
    payload:
      id: '{{conversationId}}'
      thread: '{{thread}}'
history: '{{messages}}'
display:
  submitButton:
    background: '#015DFF'
  sentMessages:
    background: '#015DFF'
    text: '#ffffff'
  receivedMessages:
    background: '#F1F2F7'
    text: '#333'
  avatar:
    background: transparent
```
This YAML outlines a more complex dialog box capable of handling multilingual setups, history display, and enhanced interactions such as file uploads. The configuration is highly customizable and tailored for dynamic interactions within a chat application, including detailed event management and payload handling.