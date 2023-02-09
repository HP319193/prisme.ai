# Form Management
Build a form with file upload and send the result by email & post data to salesforce

## [Live Demo](https://form-mail-salesforce.pages.prisme.ai)

<details>
  <summary>See DSUL </summary>

```
name: Form
slug: form-mail-salesforce
pages:
  index:
    name: My Form
    blocks:
      - name: Form
        config:
          title: Complaint
          schema:
            type: object
            properties:
              firstName:
                type: string
                title: First Name
              lastName:
                type: string
                title: Last Name
              message:
                type: string
                ui:widget: textarea
                title: Message
              date:
                type: string
                ui:widget: date
                title: Date
              file:
                type: string
                ui:widget: upload
                title: Invoice
          submitLabel: Send
          onSubmit: submit-form
      - name: Cards
        config:
          variant: square
          layout:
            type: carousel
          title: My complaints
          cards:
            - action:
                type: event
              title: Claim 1
              cover: >-
                https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/I8zxscG/JDcutMLzCnm65nKjccpGM.Prisme.ai
                Embleme.png
    styles: |-

      body {
        --color-accent: #015dff;
        --color-background: white;
        --color-text: black;
        --color-border: black;
        --color-background-transparent: rgba(0,0,0,0.05);
        --color-input-background: white;
        background-color: var(--color-background);
      }

      .content-stack__content {
        background-color: var(--color-background);
        margin-top: 1rem;
      }

      .content-stack__content .block-form {
        padding-left: 2rem !important;
      }
      .content-stack__content .block-cards,
      .content-stack__content .block-rich-text {
        padding-left: 2rem;
      }

      .page-blocks {
        padding: 2rem;
      }

      .block-form {
        padding: 0;
      }

      .block-form label {
        color: var(--color-text)
      }

      .block-form .ant-input {
        width: calc(100% - 2rem);
        border-radius: 0.625rem;
        border-color: var(--color-border);
        color: var(--color-text);
        background-color: var(--color-input-background);
      }

      .block-form .ant-input::placeholder {
        color: black;
      }
    workspaceSlug: loud-mole-60
    id: FwHBmYJ
    apiKey: e293ea5a-5298-48c8-9d59-e209aa45e497
    workspaceId: I8zxscG
imports:
  Salesforce:
    appSlug: Salesforce
    appName: Salesforce
    config:
      clientId: XX
      clientSecret: XX
      username: XX
      password: XX
      loginHost: XX
  SendMail:
    appSlug: SendMail
    appName: SendMail
automations:
  Submit-form:
    name: Submit-form
    do:
      - conditions:
          '{{file}}':
            - Salesforce.post-lead:
                lead:
                  email: '{{payload.email}}'
                  firstName: '{{payload. firstName}}'
                  lastName: '{{payload. lastName}}'
                  company: '{{payload. company}}'
                output: leadSalesforce
            - SendMail.sendMail:
                to: sales@company.com
                replyTo: no-reply@example.com
                subject: New Customers
                body: |-
                  Hey,

                  New customer with complain {{leadSalesforce.id}}
          default: []
    when:
      events:
        - submit-form
      endpoint: false

```

</details>

# Mini Marketplace
A projetct starter to have a marketplace to manage freelances & projects
## [Live Demo](https://mini-marketplace.pages.prisme.ai)


<details>
  <summary>See DSUL </summary>

## DSUL
```
name: Mini Marketplace
imports:
  Twilio:
    appSlug: Twilio
    appName: Twilio
  SendInBlue:
    appSlug: SendInBlue
    appName: SendInBlue
  Zendesk:
    appSlug: Zendesk
    appName: Zendesk
  Hubspot:
    appSlug: Hubspot
    appName: Hubspot
  Google OCR:
    appSlug: Google OCR
    appName: Google OCR
pages:
  Freelance:
    workspaceId: CqaUApK
    name:
      en: Freelance
    blocks:
      - name: Header
        config:
          automation: header
      - name: Form
        config:
          title: Search
          schema:
            type: object
            properties:
              query:
                type: string
                title: 'type anything : devops, ai, web, mobile ...'
                description: type anythin
            title: Find your perfect freelances
          onSubmit: search
          onChange: search
          submitLabel: Go
      - name: DataTable
        config:
          title: Results
          updateOn: search-results
      - name: Cards
        config:
          layout:
            type: grid
          title: Freelances
          updateOn: result-cards
    styles: |-

      body {
        --color-background: #B41040;
        --color-text: white;
        --color-border: white;
        --color-background-transparent: rgba(0,0,0,0.05)
        background-color: var(--background-color);
      }

      .page-blocks {
        padding: 2rem;
      }

      .block-form {
        padding: 0;
      }

      .block-form .ant-input {
        border-radius: 0.625rem;
        border-color: black;
      }

      .block-form .ant-input::placeholder {
        color: black;
      }
    id: cifmTZb
    permissions:
      '*':
        policies:
          read: true
    apiKey: fc261986-2eb9-41e6-a982-ac04b7d43dc4
  historique:
    workspaceId: CqaUApK
    name:
      en: Historiques des missions
    blocks:
      - name: Header
        config:
          automation: header
      - name: Form
        config:
          title: Filtre
          schema:
            type: object
            properties:
              keyword:
                type: string
                title: Mots clés
            title: Filtre des missions
          onInit: history-init
      - name: DataTable
        config:
          title: 'Mes missions précédentes:'
          automation: freelances
    styles: |-

      body {
        --color-background: #B41040;
        --color-text: white;
        --color-border: white;
        --color-background-transparent: rgba(0,0,0,0.05)
        background-color: var(--background-color);
      }

      .page-blocks {
        padding: 2rem;
      }

      .block-form {
        padding: 0;
      }

      .block-form .ant-input {
        border-radius: 0.625rem;
        border-color: black;
      }

      .block-form .ant-input::placeholder {
        color: black;
      }
    id: jG3KMKP
    apiKey: bc1ebbff-de0d-4c5d-8835-d5ec913ca9c1
  missions:
    workspaceId: CqaUApK
    name:
      en: Mes missions en cours
    blocks:
      - name: Header
        config:
          automation: header
      - name: Cards
        config:
          layout:
            type: carousel
          title: Mes missions
          automation: predict
          variant: square
    styles: |-

      body {
        --color-background: #B41040;
        --color-text: white;
        --color-border: white;
        --color-background-transparent: rgba(0,0,0,0.05)
        background-color: var(--background-color);
      }

      .page-blocks {
        padding: 2rem;
      }

      .block-form {
        padding: 0;
      }

      .block-form .ant-input {
        border-radius: 0.625rem;
        border-color: black;
      }

      .block-form .ant-input::placeholder {
        color: black;
      }
    id: RkLXaUo
    apiKey: 2d5a9284-7094-4c0d-b942-0c6f6b2c7bca
  index:
    workspaceId: CqaUApK
    name:
      en: Home
    blocks:
      - name: Header
        config:
          title: ABC
          logo:
            alt: Marketplace
          nav:
            - type: internal
              text: Freelances
              value: cifmTZb
            - type: internal
              text: Mes missions
              value: RkLXaUo
            - type: internal
              text: Mon historique
              value: jG3KMKP
          automation: header
      - name: Form
        config:
          title: Poster
          schema:
            type: object
            properties:
              title:
                type: string
                title: Titre de la demande
                description: ''
              cv:
                type: string
                title: CV
                description: Joindre un CV
                ui:widget: upload
            title: Demande de mission
            description: demande
      - name: Cards
        config:
          layout:
            type: carousel
          title: Les recommandations de missions
          automation: predict
          variant: square
      - name: DataTable
        config:
          automation: freelances
    styles: |-

      body {
        --color-background: #B41040;
        --color-text: white;
        --color-border: white;
        --color-background-transparent: rgba(0,0,0,0.05)
        background-color: var(--background-color);
      }

      .page-blocks {
        padding: 2rem;
      }

      .block-form {
        padding: 0;
      }

      .block-form .ant-input {
        border-radius: 0.625rem;
        border-color: black;
      }

      .block-form .ant-input::placeholder {
        color: black;
      }
    id: FjMOkNn
    permissions:
      '*':
        policies:
          read: true
    apiKey: 32181282-3bd5-4d46-89bd-26c31ba1bbc4
description: Marketplace demo
slug: mini-marketplace
automations:
  predict:
    name: predict
    do: []
    when:
      events: []
      endpoint: true
    output:
      cards:
        - cover: >-
            https://www.littlebigconnection.com/wp-content/uploads/2022/02/Projet-freelance-1.jpg
          title: 3D Animation+ VFX Product Ad
          description: >-
            Hello, Our soon to be launched company is looking for a 3D Rendered
            Animation product showcase advertisement that is 30 seconds long.…
        - cover: >-
            https://www.littlebigconnection.com/wp-content/uploads/2022/02/Projet-freelance-1.jpg
          title: 3D Animation+ VFX Product Ad
          description: >-
            Hello, Our soon to be launched company is looking for a 3D Rendered
            Animation product showcase advertisement that is 30 seconds long.…
        - cover: >-
            https://www.littlebigconnection.com/wp-content/uploads/2022/02/Projet-freelance-1.jpg
          title: 3D Animation+ VFX Product Ad
          description: >-
            Hello, Our soon to be launched company is looking for a 3D Rendered
            Animation product showcase advertisement that is 30 seconds long.…
  freelances:
    name: freelances
    do: []
    output:
      status: success
      data:
        - id: '1'
          employee_name: Tiger Nixon
          employee_salary: '320800'
          employee_age: '61'
          profile_image: ''
        - id: '2'
          employee_name: Garrett Winters
          employee_salary: '170750'
          employee_age: '63'
          profile_image: ''
        - id: '3'
          employee_name: Ashton Cox
          employee_salary: '86000'
          employee_age: '66'
          profile_image: ''
        - id: '4'
          employee_name: Cedric Kelly
          employee_salary: '433060'
          employee_age: '22'
          profile_image: ''
        - id: '5'
          employee_name: Airi Satou
          employee_salary: '162700'
          employee_age: '33'
          profile_image: ''
        - id: '6'
          employee_name: Brielle Williamson
          employee_salary: '372000'
          employee_age: '61'
          profile_image: ''
        - id: '7'
          employee_name: Herrod Chandler
          employee_salary: '137500'
          employee_age: '59'
          profile_image: ''
        - id: '8'
          employee_name: Rhona Davidson
          employee_salary: '327900'
          employee_age: '55'
          profile_image: ''
        - id: '9'
          employee_name: Colleen Hurst
          employee_salary: '205500'
          employee_age: '39'
          profile_image: ''
        - id: '10'
          employee_name: Sonya Frost
          employee_salary: '103600'
          employee_age: '23'
          profile_image: ''
        - id: '11'
          employee_name: Jena Gaines
          employee_salary: '90560'
          employee_age: '30'
          profile_image: ''
        - id: '12'
          employee_name: Quinn Flynn
          employee_salary: '342000'
          employee_age: '22'
          profile_image: ''
        - id: '13'
          employee_name: Charde Marshall
          employee_salary: '470600'
          employee_age: '36'
          profile_image: ''
        - id: '14'
          employee_name: Haley Kennedy
          employee_salary: '313500'
          employee_age: '43'
          profile_image: ''
        - id: '15'
          employee_name: Tatyana Fitzpatrick
          employee_salary: '385750'
          employee_age: '19'
          profile_image: ''
        - id: '16'
          employee_name: Michael Silva
          employee_salary: '198500'
          employee_age: '66'
          profile_image: ''
        - id: '17'
          employee_name: Paul Byrd
          employee_salary: '725000'
          employee_age: '64'
          profile_image: ''
        - id: '18'
          employee_name: Gloria Little
          employee_salary: '237500'
          employee_age: '59'
          profile_image: ''
        - id: '19'
          employee_name: Bradley Greer
          employee_salary: '132000'
          employee_age: '41'
          profile_image: ''
        - id: '20'
          employee_name: Dai Rios
          employee_salary: '217500'
          employee_age: '35'
          profile_image: ''
        - id: '21'
          employee_name: Jenette Caldwell
          employee_salary: '345000'
          employee_age: '30'
          profile_image: ''
        - id: '22'
          employee_name: Yuri Berry
          employee_salary: '675000'
          employee_age: '40'
          profile_image: ''
        - id: '23'
          employee_name: Caesar Vance
          employee_salary: '106450'
          employee_age: '21'
          profile_image: ''
        - id: '24'
          employee_name: Doris Wilder
          employee_salary: '85600'
          employee_age: '23'
          profile_image: ''
    when:
      events: []
      endpoint: true
  search:
    name: search
    do:
      - conditions:
          '{{payload.query}}': []
          default:
            - emit:
                event: search-results
                payload:
                  data: []
            - break:
                scope: automation
      - emit:
          event: search-results
          payload:
            data:
              - title: Karan T.
                description: DevOps and Cloud Engineer
      - emit:
          event: result-cards
          payload:
            cards:
              - cover: >-
                  https://www.littlebigconnection.com/wp-content/uploads/2022/02/men-freelance-au-travail.jpg
                title: Karan T.
                description: DevOps and Cloud Engineer
      - break: {}
    when:
      events:
        - search
      endpoint: false
  header:
    name: Get header
    do: []
    when:
      events: []
      endpoint: true
    output:
      title: ABC
      logo:
        src: >-
          https://d1csarkz8obe9u.cloudfront.net/posterpreviews/fake-text-artwork%2C-design-template-cee7068ce7d824341a811cf718953531_screen.jpg?
        alt: Marketplace
      nav:
        - type: internal
          text: Freelances
          value: cifmTZb
        - type: internal
          text: Mes missions
          value: RkLXaUo
        - type: internal
          text: Mon historique
          value: jG3KMKP
  Automatisation:
    name: Automatisation
    do: []

```

</details>

# API Creation 
Create an API with Custom Code & managing errors with events.

## Demo 
```
Curl https://api.studio.prisme.ai/v2/workspaces/qnSDuiG/webhooks/helloworld
```

<details>
  <summary>See DSUL</summary> 

```
name: API
slug: big-quail-22
imports:
  Custom Code:
    appSlug: Custom Code
    appName: Custom Code
    config:
      functions:
        CleanData:
          code: return "Hello World"
          parameters:
            data:
              type: string
  Elastic:
    appSlug: Elastic
    appName: Elastic
automations:
  helloworld:
    name: Hello Worlds
    do:
      - Custom Code.run:
          function: CleanData
          output: cleanData
      - emit:
          autocomplete: {}
          payload:
            body: '{{body}}'
            headers: '{{headers}}'
          event: debug
    when:
      events: []
      endpoint: true
    output:
      message: '{{cleanData}}'
    arguments:
      firstName:
        type: string
      lastName:
        type: string
  Manage-error:
    name: "Manage\_ Error"
    do:
      - Elastic.Search:
          index: debug
          host: myhost
    private: true
    when:
      events:
        - debug
      endpoint: false

```

</details>


# Chatbot with slot filling
Type message such as " I Love fruits" or "I love kiwi"

## [Online demo](https://prefered-fruits.pages.prisme.ai/en)

<details>
  <summary>See DSUL</summary> 
  
```
name: Chatbot
slug: prefered-fruits
pages:
  moody-lionfish-86:
    name:
      en: Training
    blocks:
      - name: Dialog Manager.config
    styles: |-

      body {
        --color-accent: #015dff;
        --color-background: white;
        --color-text: black;
        --color-border: black;
        --color-background-transparent: rgba(0,0,0,0.05);
        --color-input-background: white;
        background-color: var(--color-background);
      }
    workspaceSlug: prefered-fruits
    id: mMM_dbL
    apiKey: 3d735d98-43b4-4356-9a34-a23ba0ea6fdd
    workspaceId: 3Ryz7AG
  index:
    name: Chat
    blocks:
      - name: Dialog Box.Dialog Box
        config:
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
              background: '#015DFF'
          setup:
            input:
              enabled: true
              event: sendInput
              placeholder: Type your message
          messageEvent: Dialog Box.message
          onInit: initChat
          updateOn: updateChat
        key: LqKpe5unkDzsGhH9RWlpq
    styles: |-

      body {
        --color-accent: #015dff;
        --color-background: white;
        --color-text: black;
        --color-border: black;
        --color-background-transparent: rgba(0,0,0,0.05);
        --color-input-background: white;
        background-color: var(--color-background);
      }
    workspaceSlug: prefered-fruits
    id: cknfT0j
    apiKey: 86e86db0-8558-4631-9323-35ee7fdcdf9c
    workspaceId: 3Ryz7AG
imports:
  Dialog Box:
    appSlug: Dialog Box
    appName: Dialog Box
  Dialog Manager:
    appSlug: Dialog Manager
    appName: Dialog Manager
    config:
      intents:
        preferences:
          phrases:
            - I prefer
            - I love fruits
            - I love [kiwi](prefered)
          slots:
            - name: prefered
              entity: fruits
        Welcome:
          phrases:
            - Hola
            - Hola
            - Hey
            - Hey
            - Hello
      entities:
        fruits:
          useSynonyms: true
          vocabulary:
            banana: []
            kiwi: []
          automaticallyExtensible: false
      NLU:
        bot_id: 0bc75ccd-e321-4a4d-9bac-4d00842c85f7
        client_token: bd1f880f-a110-452b-ab29-4292c3f278ed
        developer_token: b5dd7d7e-e3e2-4ee8-b6e9-d792edc8f6fb
photo: >-
  https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/3Ryz7AG/TrOg5KOCeA-pUTPFlxWoy.Prisme.ai
  Embleme.png
automations:
  chat user query:
    name: Manage User Query
    do:
      - delete:
          name: session.slotFilling
      - Dialog Box.sendText:
          text: '{{payload.input}}'
          from:
            userId: '{{user.id}}'
      - Dialog Manager.talk:
          text: '{{payload.input}}'
          language: fr
    when:
      events:
        - sendInput
      endpoint: false
  Init Chat:
    name: Init Chat
    do:
      - Dialog Box.sendText:
          text: Hello
    when:
      events:
        - initChat
      endpoint: false
  action-intent-prefered:
    name: "Action : Intent Prefered\_"
    do:
      - Dialog Manager.ask:
          question: what fruit do you prefer ?
          slotName: prefered
          output: prefered
      - Dialog Box.sendText:
          text: 'Ok. I like {{prefered}} too! '
    when:
      events:
        - Dialog Manager.intents.detected.preferences
      endpoint: false
  action-fallback-intent:
    name: 'Action : Fallback Intent'
    do:
      - Dialog Box.sendText:
          text: Hum. I don't get it.
    when:
      events:
        - Dialog Manager.intents.detected.Fallback Intent
      endpoint: false
  action-welcome-intent:
    name: 'Action : Welcome Intent'
    do:
      - Dialog Box.sendText:
          text: 'Hey! '
    when:
      events:
        - Dialog Manager.intents.detected.Welcome
      endpoint: false
  Manage-slot-filling:
    name: Manag Slot filling
    when:
      events:
        - Dialog Manager.message
    do:
      - conditions:
          '{{payload.message.type}} == "question"':
            - Dialog Box.sendText:
                text: '{{payload.message.text}}'

```
</details>

# Paginated DataTable

This page and automation allow to browse big collections with infinite amount of data.
This uses a Collection app which was renamed as "TodoList". 

Video explanation: https://www.loom.com/share/3b68d9c039104bb1a730bd8c393b140e

<details>
  <summary>See DSUL</summary> 

Page:

```yaml
slug: long-table
name:
  fr: Long Table
blocks:
  - slug: DataTable
    config:
      data: []
      onInit: initTodoTable
      updateOn: updateTodoTable
```

Automation:

```yaml
slug: updateTodoTable
name: Update Todo Table
do:
  - set:
      name: pageSize
      value: 10
  - conditions:
      '{{run.trigger.value}} == "accessPage"':
        - set:
            name: page
            value: '{{payload.page}}'
      default:
        - set:
            name: page
            value: 1
  - TodoList.find:
      query: {}
      options:
        limit: '{{pageSize}}'
        page: '{{page}}'
      output: tasks
  - TodoList.reportUsage:
      output: tasksUsage
  - emit:
      options:
        persist: true
      autocomplete: {}
      event: updateTodoTable
      payload:
        data: '{{tasks}}'
        pagination:
          event: accessPage
          page: '{{page}}'
          itemCount: '{{tasksUsage.documents}}'
          pageSize: '{{pageSize}}'
when:
  events:
    - initTodoTable
    - accessPage
  endpoint: false
```
</details>


