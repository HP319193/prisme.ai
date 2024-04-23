## Pages

## Overview
A page is a block-based container web page utilizes modular building components, allowing for the assembly of a complex web page structure that is highly reusable, scalable, and efficient in facilitating digital transformation. Unlike pixel-by-pixel design, this approach emphasizes reusability and modularity, enhancing the quality and speed of web development.

**Core Concepts:**

1. **Container vs. Block**:
   - **Container**: Represents the overall structure of the page that holds various blocks.
   - **Block**: Modular units within the container that handle specific functionalities or content displays.

2. **Reusability**:
   - Blocks are designed to be reused across different pages or projects, minimizing redundancy and ensuring consistency across platforms.

3. **Quality**:
   - Utilizing predefined blocks ensures that each component meets certain standards of performance and design, maintaining high quality across the web experience.

4. **Speed in Digitalization**:
   - By using blocks that are pre-tested and ready to integrate, organizations can speed up the process of deploying new digital solutions.

**Detailed Explanation of Attributes:**

1. **Slug**:
   - **Purpose**: Acts as a unique identifier for the page, useful in routing and linking.
   - **Example**: `slug: produits/medicament/api-biox

2. **Name**:
   - **Purpose**: Provides a multilingual name for the page, used for SEO, accessibility, and user interface display.
   - **Example**:
     ```yaml
     name:
       fr: Api-bioxal® poudre pour traitement dans la ruche - Laboratoire
       en: Api-bioxal® powder for treatment in the hive - Laboratoire
     ```

3. **Blocks**:
   - **Purpose**: Define the specific components that make up the page. Each [**block**](#blocks)  can have its own nested blocks, creating a deeply structured and rich content experience.
   - **Example**:
     ```yaml
     blocks:
       - slug: Layout
         content:
           blocks:
             - slug: Summary
               cover: [URL]
               title:
                 fr: Api-bioxal® poudre pour traitement dans la ruche
                 en: Api-bioxal® powder for treatment in the hive
               content: {}
               path:
                 links:
                   - type: internal
                     text:
                       fr: Accueil
                       en: Home
                     value: /index
                   - type: internal
                     text:
                       fr: Notre gamme vétérinaire
                       en: Veterinary range
                     value: /gamme-veterinaire
                   - type: internal
                     text:
                       fr: Api-bioxal® poudre pour traitement dans la ruche
                       en: Api-bioxal® powder for treatment in the hive
                     value: /produits/medicament/api-bioxal-poudretraitement-dansruche
             - slug: MedVet
               id: d25d5e64-e9ae-4780-ad5f
     ```

4. **Styles**:
   - **Purpose**: Custom CSS rules to define the visual style and layout of the page. This can include color schemes, typography, and layout behaviors.
   - **Example**:
     ```yaml
     styles: |
       body {
         --color-accent: #015dff;
         --color-accent-light: #80A4FF;
         --color-accent-dark: #052e84;
         --color-accent-darker: #03133a;
         --color-accent-contrast: white;
         --color-background: white;
         --color-text: black;
         --color-border: black;
         --color-background-transparent: rgba(0,0,0,0.05);
         --color-input-background: white;
         background-color: var(--color-background);
       }
       .page-blocks > .pr-block-blocks-list {
         display: flex;
         flex-direction: column;
         min-width: 100%;
         min-height: 100%;
         flex: 1;
       }
       .pr-poweredby {
         position: fixed;
         left: 1rem;
         bottom: 1rem;
       }
     ```

5. **Automation and Updates**:
   - **Purpose**: Automate certain processes upon initialization and specify what actions trigger updates to the page.
   - **Example**:
     ```yaml
     automation: init
     updateOn: update page
     ```

## Redirection Handling

Redirection is a mechanism to navigate from one resource to another automatically. This can be triggered through various attributes and methods as described below, enhancing the user experience by enabling dynamic navigation based on user actions, language changes, or other conditional logic.

### Redirection Attributes:

- **`url`**: Specifies the destination URL for the redirection. It can be either a relative path or an absolute URL. If omitted, the current page location is used, which is useful for operations like language switching without navigating away from the current page.
- **`locale`**: Used to switch the language or regional settings of the current page, aiding in localization without the need for a page reload.
- **`method`**: The HTTP method to use when redirecting. The default method is `GET`, but `POST` can be used if there's a need to submit data to the server during redirection.
- **`body`**: When using the `POST` method, this object contains data that will be sent as the HTTP POST request body.
- **`push`**: Utilizes the browser's `pushState` method to change the URL in the browser address bar without reloading the web page, facilitating a smoother user experience in single-page applications.

### Usage Example:
Here is how you might configure a redirection within a page:
```yaml
redirection:
  url: "/new-page"
  locale: "fr"
  method: "get"
  push: true
```

## Blocks

### Overview:
Blocks are reusable web components that can be hosted remotely and integrated into various pages across a web platform. These blocks can be dynamically loaded and configured within a page, allowing for flexible design and functionality customization.

### Declaration of Blocks:

To integrate a block into a platform, it must be declared within the workspace's source code. This declaration includes essential details about the block, such as its name, description, and source URL.

### Block Declaration Syntax:

```yaml
blocks:
  config:
    name: Block name
    description: Block description
    url: https://cdn.company.com/public/someblock/main.js
```

### Key Components:

- **`name`**: A human-readable name for the block, which appears within the page editor, aiding users in identifying and selecting the appropriate block for their needs.
- **`description`**: A brief description of what the block does, providing context to users and helping them understand its functionality.
- **`url`**: The URL pointing to the block's entry point, typically a `.js` file if the block conforms to the [BlockProtocol module](https://blockprotocol.org/) standards. This URL can also point to other resources loaded within an iframe.

