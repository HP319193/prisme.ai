# Pages

## Definitions 

Pages allow you to build custom graphical interfaces using [**Blocks**](#blocks) provided by your workspace **and** its [AppInstances](../apps#appinstances) :  

![image](/assets/images/workspaces/page.png)  

At the right appears the list of available blocks separated by **AppInstance** : multiple instances of the same app will provide the same blocks, each of them consuming the data, endpoints & configuration from their respective instance.  

## Blocks
Blocks are web graphical components hosted anywhere on the web, which can then be integrated & configured inside a **Page**.  

In order to make a block available to the page editor, it needs to be declared inside a **blocks** field at the root of the workspace source code :  

```yaml
blocks:
  config:
    name: Block name
    description: Block description 
    url: https://cdn.company.com/public/someblock/main.js
```

* The lowercased **editor** stands for the technical name that will be referenced inside your pages  
* The **name: Editor** stands for the human readable name showing up inside the page editor  
* **url** might references a **.js** entrypoint for the block, or any other URL that will be loaded inside an iframe.  

If **url** points to a **.js** file, this must be the entrypoint of a [BlockProtocol module](https://blockprotocol.org/).  
