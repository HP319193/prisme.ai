# Pages

## Definitions 

Pages allow you to build custom graphical interfaces using [**Widgets**](#widgets) provided by your workspace **and** its [AppInstances](../apps#appinstances) :  

![image](/assets/images/workspaces/page.png)  

At the right appears the list of available widgets separated by **AppInstance** : multiple instances of the same app will provide the same widgets, each of them consuming the data, endpoints & configuration from their respective instance.  

## Widgets
Widgets are the building blocks of **Pages**. They are web graphical components hosted anywhere on the web, which can then be integrated & configured inside a **Page**.  

In order to make a widget available to the page editor, it needs to be declared inside a **widgets** field at the root of the workspace source code :  

```yaml
widgets:
  editor:
    name: Editor
    url: https://cdn.company.com/public/someWidget/main.js
```

* The lowercased **editor** stands for the technical name that will be referenced inside your pages  
* The **name: Editor** stands for the human readable name showing up inside the page editor  
* **url** might references a **.js** entrypoint for the widget module, or any other URL that will be loaded inside an iframe.  

If **url** points to a **.js** file, this must be the entrypoint of a [BlockProtocol module](https://blockprotocol.org/).  
