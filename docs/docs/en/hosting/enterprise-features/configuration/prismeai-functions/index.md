This microservice is capable of running custom user functions (NodeJS or Python).   

## Installation prerequisites

Here is a few thing that should be considered:   

* The **service must have access to a npm registry**. You can use the `NPM_CONFIG_REGISTRY` environment variable to specify your own.  
* The service needs a volume, we recommend using volumes with a high I/O speed as it might be highly solicited when installing dependencies for example.  

## Environment variables  

<table>
  <tr>
    <td>Name</td>
    <td>Description</td>
    <td>Default value</td>
  </tr>

  <!-- Python -->
  <tr>
    <td>PYTHON_FUNCTIONS_RUN_TIMEOUT</td>
    <td>Python Functions execution timeout (ms)</td>
    <td>20000</td>
  </tr>        

  <tr>
    <td>PYTHON_API_URL</td>
    <td>Python API url</td>
    <td>http://localhost:8000</td>
  </tr>        

  <!-- NodeJS -->
  <tr>
    <td>PORT</td>
    <td>HTTP port</td>
    <td>4000</td>
  </tr>      

  <tr>
    <td>FUNCTIONS_STORAGE_FILESYSTEM_DIRPATH</td>
    <td>Functions directory path</td>
    <td>data/functions/</td>
  </tr>    

  <tr>
    <td>FUNCTIONS_RUN_TIMEOUT</td>
    <td>Functions execution timeout (ms)</td>
    <td>20000</td>
  </tr>        

  <tr>
    <td>FUNCTIONS_WORKERS_MAX_LRU</td>
    <td>Maximum number of function workers kept in memory</td>
    <td>500</td>
  </tr> 

  <tr>
    <td>NODE_BUILTIN_MODULES</td>
    <td>Allowed builtin modules</td>
    <td>http, https, url, util, zlib, dns, stream, buffer, crypto</td>
  </tr>   

  <tr>
    <td>NPM_CONFIG_REGISTRY</td>
    <td>NPM registry url</td>
    <td>https://registry.npmjs.org/</td>
  </tr>     

  <tr>
    <td>NODE_WORKER_MAX_OLD_GENERATION_SIZE_MB</td>
    <td>NodeJS function worker <a href="https://nodejs.org/api/worker_threads.html#workerresourcelimits">maxOldGenerationSizeMb</a></td>
    <td>100MB</td>
  </tr>       

  <tr>
    <td>INACTIVE_NODE_WORKER_DELETION_TIMEOUT</td>
    <td>Inactive period in seconds after which node workers are automatically terminated</td>
    <td>3600</td>
  </tr>         


  <tr>
    <td>UPDATE_SCRIPTS_ON_STARTUP</td>
    <td>If set to yes or true, makes sure function scripts are in-sync with corresponding workspace.yaml files on start-up. Useful to migrate functions after an upgrade with breaking changes. Please care that in case of a multi-instances deployment, every instance will run this migration.</a></td>
    <td>no</td>
  </tr>         
  
  <tr>
    <td>REQUEST_MAX_SIZE</td>
    <td>Maximum request body size (format from bodyParser.json)</td>
    <td>1mb</td>
  </tr>           
</table>

## Microservice testing

  1. Create a function "workspace" (named `test` and containing a `hello` function):

    ```bash
    curl --location 'http://localhost:4000/v2/functions/test' \
    --header 'Content-Type: application/json' \
    --data '{
        "functions": {
            "hello": {
                "code": "return \"Hello \" + name;",
                "parameters": {
                    "name": {
                        "type": "string"
                    }
                }
            }
        }
    }'
    ```

    If successful, the same body should be returned in response.  

  2. Run the function:  

    ```bash
    curl --location 'http://localhost:4000/v2/functions/test/run/hello' \
    --header 'Content-Type: application/json' \
    --data '{
        "parameters": {
            "name": "world"
        }
    }'
    ```

    If successful, the answer should be similar to this:   
    ```json
    {
        "result": "Hello world",
        "logs": [],
        "duration": 38
    }
    ```

Congratulations, you service is up and running!

## Features

### Async functions  
Even if they do not use any async call, every functions are always annotated as "async".  
As such, calling a function from the same workspace must be done with **await** keyword. See **Shared execution context** for a full example.

### Shared execution context  
Functions from the same workspace are executed within a generated JS file gathering these functions together. This allows functions to call each others :  

**funcA** :  
```
  return "world";
```

**funcB** :  
```
  return "hello " + (await funcA());
```

### Shared memory  
Functions from the same workspace are executed within the same worker NodeJS and VM2 instance. Although their inner variables are automatically destroyed after each execution, a special **cache** variable is provided to **share memory between functions and accross executions** :  

Example:  
**funcA** :  
```
let counter = cache['counter']

counter = (counter || 0) + 1

cache['counter'] = counter;

return counter;
```

**funcB** :  
```
  let counter = cache['counter'];
  return "Counter : " + counter;
```
