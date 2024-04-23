# RichText Block 

**1. Technical Objective:**

The "RichText Block" is designed to display formatted text content within a user interface, supporting a variety of customization options such as custom CSS styling and embedded JavaScript. This block is ideal for presenting text in a visually appealing manner and can handle simple text displays as well as complex setups with scripting and styling enhancements for web content.

**2. Field Descriptions and Explanations:**

**Example 1: Simple RichText**

- **slug**: Identifier for the RichText block.

- **content**: The textual content displayed within the block. This example contains a repeated piece of text emphasizing a specific message or theme.

- **css**: Custom CSS properties to style the RichText block, adjusting aspects like color, font size, style, and responsive behavior.

**Example 2: Complex RichText with Embedded JavaScript**

- **slug**: Identifier for the RichText block.

- **content**: HTML content with links to external CSS for styling and JavaScript libraries for functionality. This example uses Highlight.js to enhance code snippets visually.

- **allowScripts**: A flag that permits the execution of scripts within the RichText content, essential for incorporating interactive or dynamic script-based features.

- **markdown**: Specifies whether the content is to be interpreted as Markdown. In this case, it is set to false since the content includes HTML and script tags.

**3. Yaml files (See code section):**

**Example 1:**
```yaml
slug: RichText
content: Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
css: |-
  :block {
    color: rgba(0, 0, 0, 0.80);
    font-size: 2.4rem;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    width: calc(100% / 3 * 2);
  }
  @media (max-width: 768px) {
    :block {
      width: 100%;
    }
  }
```
This YAML configuration defines a simple text display with rich formatting options. The text is styled with custom CSS to adjust the visual presentation based on the display width, making it responsive.

**Example 2:**
```yaml
slug: RichText
content: |-
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai-sublime.min.css"></link>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"></script>
  <script>
    if (!window.hljsIsLoaded) {
      window.hljsIsLoaded = true
      setInterval(() => hljs.highlightAll(), 1000);
    }
  </script>
allowScripts: true
markdown: false
```
This configuration outlines a RichText block designed to enhance code snippets using Highlight.js, a popular syntax highlighting library. The `allowScripts` parameter enables script execution within the block, crucial for the dynamic aspects of the code highlighting. This setup is ideal for technical documentation or tutorials where code readability is enhanced visually.