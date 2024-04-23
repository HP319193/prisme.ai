# Block Form

Form Block helps building a form with complex fields able to emit events on values changes or when submitting it.

**1. Technical Objective:**

The technical objective of "Block Form" is to define a versatile and multi-lingual form interface for users to input structured data. This data is used for various functionalities like issue reporting, assistant customization, and contact information submission, adhering to specific schema constraints and user interface guidelines.

**2. Field Descriptions and Explanations:**

**Example 1: Issue Reporting Form**
- **slug**: Identifier for the form.
- **title**: The title of the form provided in both French and English.
- **schema**: Describes the structure of the form data as an object with properties:
  - **title**: Text input for the issue's title with placeholders in both languages.
  - **content**: Textarea for detailed issue description with specified rows.
  - **attachments**: Allows file uploads as an array of strings.
- **submitLabel**: Label for the submission button in both languages.
- **onSubmit**: Event to trigger to handle form submission (e.g., `submitIssue`).
- **css**: Custom CSS to style the form.
- **updateOn**: Event to trigger to update form after submission (e.g., `updateTicketsTable`).

**Example 2: Assistant Configuration Form**
- **slug**: Identifier for the form.
- **values**: Pre-defined values that can populate the form fields.
- **schema**: Structure describing each configuration option for the assistant:
  - **name**, **description**, **img**, **prompt**: Fields for basic assistant details.
  - **starters**: An array to specify initial conversational prompts.
  - **welcome**, **fallbackAnswer**: Textareas for customizable messages.
  - **public**, **unlisted**: Boolean flags to control visibility in the Store.
- **onSubmit**: Specifies how to handle form submission, including event name and payload.
- **submitLabel**: Text for the update button in both languages.

**Example 3: Contact Form**
- **slug**: Form identifier.
- **onSubmit**: Event to trigger to handle form submission (e.g., `submitContact`).
- **className**: Additional CSS classes to apply (e.g., `flat-radio`).
- **schema**: Defines the form fields for contact details:
  - **help**: A block to display contact instructions.
  - **email**, **phone**, **civil**, **firstName**, **lastName**, **company**, **address**: Various fields for personal and contact details, each with validation rules.
  - **message**: Textarea for additional user messages.
  - **captcha**: Integration for bot protection.
  - **optin**: Boolean field for marketing consent.
- **css**: Custom styles for the form layout and elements.

**3. Yaml files (see code section on the Builder):**

**Example 1:**
```yaml
slug: Form
title:
  fr: La description de votre demande.
  en: Issue description.
schema:
  type: object
  properties:
    title: {type: string, placeholder: {fr: Objet de la demande, en: Subject}}
    content: {type: string, ui:widget: textarea, placeholder: {fr: Décrivez votre demande ici, en: Describe your issue here}}
    attachments: {type: array, items: {type: string, ui:widget: upload}}
submitLabel:
  fr: Soumettre
  en: Submit
onSubmit: submitIssue
css: |
  :block { display: flex; ... }
```
This YAML configuration outlines a form for issue reporting, with fields for title, content, and file attachments. It includes placeholders for multilingual support, a submit action, and custom CSS styling.

**Example 2:**
```yaml
slug: Form
values: '{{assistant}}'
schema:
  type: object
  properties:
    name: {type: localized:string, title: {fr: Nom de l'assistant, en: Assistant name}}
    prompt: {type: string, ui:widget: textarea, title: {fr: Instructions (prompt), en: Prompt}}
onSubmit:
  event: update assistant
  payload: {id: '{{assistant.id}}'}
submitLabel:
  fr: Mettre à jour l'assistant
  en: Update Assistant
```
This configuration is designed for setting up or updating assistant attributes like name and initial prompts, allowing dynamic interaction defined by the `onSubmit` action.

**Example 3:**
```yaml
slug: Form
onSubmit: submitContact
className: flat-radio
schema:
  type: object
  properties:
    help:
      title: Contactez-nous
      ui:widget: block
      ui:options:
        block:
          slug: RichText
          content: Envoyez nous vos coordonnées afin qu'un de nos conseillers puisse vous recontacter le plus rapidement possible.
          css: |-
            :block {
              display: flex;
              background-color: #F2F7FB;
              border-radius: 0.6rem;
              padding: 1.3rem;
              color: #3051D7;
              font-weight: 600;
              font-size: 1.3rem;
            }
    email:
      type: string
      title: ''
      placeholder: Votre email (requis)
      validators:
        required:
          message: Veuillez indiquer votre email
        email:
          message: Ceci n'est pas un email valide
    phone:
      type: string
      title: ''
      placeholder: Numéro de téléphone
      validators:
        tel:
          message: Ceci n'est pas un numéro de téléphone valide.
        pattern:
          value: ^(\+[0-9]+)?[0-9]{10}$
          message: Ceci n'est pas un numéro de téléphone valide.
    civil:
      type: string
      title: ''
      enum:
        - 1
        - 2
      enumNames:
        - Monsieur
        - Madame
      ui:widget: radio
      validators:
        required: true
    firstName:
      type: string
      title: ''
      placeholder: Prénom (requis)
      validators:
        required: true
    lastName:
      type: string
      title: ''
      placeholder: Nom (requis)
      validators:
        required: true
    company:
      type: string
      title: Quel est votre employeur ? (requis)
      placeholder: 'Exemple : SNCF, Vinci, Twitter'
      validators:
        required:
          message: Veuillez indiquer votre employeur
      ui:widget: autocomplete
      ui:options:
        autocomplete:
          options: '{{autocompletion}}'
          minChars: 3
    address:
      type: string
      title: Indiquez votre code postal
      ui:widget: block
      ui:options:
        block:
          slug: Google Geocoding.autocomplete
          showSubmit: false
          selectEvent: addressChanged
          onChange: addressChanged
          countries:
            - fr
          css: |-
            :block {
              font-size: 1.4rem;
            }
    message:
      type: string
      title: ''
      placeholder: Message (indiquez-nous les raisons de votre demande de contact)
      ui:widget: textarea
    captcha:
      title: ''
      ui:widget: block
      ui:options:
        block:
          slug: hCaptcha.hCaptcha
          siteKey: '{{siteKey}}'
          css: |-
            :block {
              display: flex;
              justify-content: center;
            }
    optin:
      type: boolean
      title: J’accepte de recevoir des offres commerciales.
      validators:
        required:
          message: Veuillez accepter les CGU
css: |-
  :block {
    display: flex;
    flex: 1 1 0%;
    flex-direction: column;
    --pr-form-margin-size: 0;
    margin-bottom: 3rem;
  }
  :block .pr-form-object__property {
    margin: 1.6rem 0;
  }
  :block .pr-form-object__property:nth-child(1) .pr-form-label {
    color: var(--secondary-color);
    font-size: 2.3rem;
    font-weight: 600;
    margin-bottom: 4rem;
  }
  :block .pr-form-input, :block .ant-input {
    font-size: 1.6rem;
  }
  :block .ant-input {
    min-height: 3.5rem;
  }
  :block .pr-form-boolean {
    display: flex;
    flex-direction: row;
  }
  :block .pr-form-boolean__label {
   
```
The form is designed to gather comprehensive contact information from users in a structured and secure manner while providing a user-friendly interface. Each field is specifically tailored to capture essential details, employing validations to ensure data integrity and compliance with user input standards.


Form structure is built with [Schema Form](/workspaces/schemaform) API.
