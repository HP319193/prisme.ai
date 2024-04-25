# Popover Block (In-page integration)

## Setup

**1. Technical Objective:**
The "Popover Block" is designed to provide contextual information, tips, or interactions within a small, floating dialog that appears in response to user actions or events. It can display dynamic content, such as buttons and tooltips, and is highly configurable with regard to appearance and behavior.

**2. Field Descriptions and Explanations:**

**Example 1: Simple Popover**

- **slug**: Identifier for the popover block.

- **config**: Primary configuration settings for the popover:

  - **urlFrom**: Source page or component from where the popover is triggered.

  - **url**: The URL where the popover should fetch its content or define the target upon interaction.

  - **config**: Further customization of interactive elements within the popover:

    - **button**: Settings for a button inside the popover, including background color and icon URL.

- **header**: Configuration for the header part of the popover:

  - **subtitle** and **title**: Text content for the popover's header.

  - **bgColor**: Background color of the header.

  - **closeColor**: Color of the close button in the header.

- **tooltip**: Configuration for a tooltip associated with the popover:

  - **text**: Tooltip text to display.

  - **openDelay**: Delay in seconds before the tooltip appears after triggering.

- **container**: Visual and animation settings for the popover's container:

  - **animation**: Type of animation effect for the popover's appearance (e.g., slide).

**3. Yaml file:**


```yaml
slug: Popover.Popover
config:
  urlFrom: 0
  url: /index
  config:
    button:
      bgColor: '#243882'
      icon: https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/rGVzKy0/modSw_FkHW9V9FfPq2DnJ.Prisme.ai_Embleme_.png
header:
  subtitle: Subtitle
  title: Title
  bgColor: '#ab8787'
  closeColor: '#ad9090'
tooltip:
  text: A question ?
  openDelay: 2
container:
  animation: slide
```
This YAML configuration specifies a simple popover block setup. It includes detailed visual settings for both the button within the popover and the header, such as background and close button colors. The tooltip adds an interactive element that enhances user engagement by displaying contextual information with a delay, making it more dynamic and user-friendly. The animation "slide" suggests a smooth entry effect for the popover, enhancing the visual appeal and user experience.

This setup is ideal for applications requiring contextual information or guidance without navigating away from the current view, enhancing usability and providing a seamless interactive experience.

## Integrating the "Popover Block" into Existing Websites

**Technical Objective:**
The "Popover Block" is designed to seamlessly integrate into existing websites to provide contextual information or interactive content through a dynamic popover dialog. This integration is especially suitable for websites built with HTML or content management systems (CMS) like WordPress, Joomla, or TYPO3.

**Steps for Integration:**
To integrate the "Popover Block" into an existing website, follow these steps to ensure correct functionality and appearance:

1. **Obtain the Popover Script:** After configuring your popover in the Prisme.ai Builder, you will be provided with a JavaScript snippet that needs to be included in your website.

2. **Embedding the Script:**
   - **Location**: The script should be placed just before the closing `</body>` tag of your HTML document. This positioning ensures that all the necessary DOM elements are loaded before the script executes, which is crucial for the correct initialization and display of the popover.
   - **CMS Integration**: For CMS platforms like WordPress, Joomla, or TYPO3, insert the script into the template or use a custom HTML module/plugin that allows adding JavaScript before the page's footer section.

3. **Script Example:**
```html
<script src="https://cdn-assets.prisme.ai/blocks/popover/inject/index.js"></script>
<script type="text/javascript">
Prismeai.popover({
  "config": {
    "urlFrom": 0,
    "url": "/index",
    "config": {
      "button": {
        "bgColor": "#243882",
        "icon": "https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/rGVzKy0/modSw_FkHW9V9FfPq2DnJ.Prisme.ai_Embleme_.png"
      }
    }
  },
  "url": ""
})
</script>
```
   - **Details**: This script not only includes the source of the popover functionality (`inject/index.js`) but also initializes the popover with specific configurations. It sets up the button appearance and defines the URL handling within the popover.

   - **Customization**: The script parameters (`urlFrom`, `url`, and `button` settings) can be customized based on the specific requirements of your site or the particular user interaction desired.

4. **Testing and Validation:**
   - **Test the Integration**: After embedding the script, thoroughly test the popover on your website to ensure it activates and functions as expected across different devices and browsers.

   - **Debugging**: Check for any console errors and ensure there are no conflicts with existing scripts or stylesheets on your website.

**Additional Tips:**
- **Accessibility and Performance**: Consider the impact of the popover on site performance and accessibility. Ensure it does not obstruct content or interfere with the user experience on mobile devices.

- **Security**: Always serve content over HTTPS, especially when integrating third-party scripts, to enhance the security of your site.

By following these guidelines, you can effectively integrate a dynamic "Popover Block" into your existing website, enhancing user engagement and providing valuable contextual information in an interactive format.