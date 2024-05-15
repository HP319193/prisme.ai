## Installation prerequisites

This service need access to a volume on which the data will be saved and retrieved.     
Currently, two drivers are supported : `FILESYSTEM` and `AWS_S3`, you can refer to the table below in order to set it up.  

Also, make sure to enable the microservice in the provided helm charts as this microservice is disabled by default.

## Environment variables


<table>
  <tr>
    <td>Name</td>
    <td>Description</td>
    <td>Default value</td>

  </tr>

  <!-- Common -->
  <tr>
    <td>STORAGE_DRIVER</td>
    <td>Storage driver used to store all bots related files. Available values : FILESYSTEM, AWS_S3</td>
    <td>FILESYSTEM</td>
  </tr>
  <tr>
    <td>GUNICORN_ACCESS_LOGFILE</td>
    <td>If declared, the NLU will start logging HTTP logs to the specified folder, make sure the path is writable. Example : `/var/log/httpd-access.log`</td>
    <td></td>
  </tr>
  <tr>
    <td>TRAIN_ON_TALK_TIMEOUT</td>
    <td>Upon calling the /talk API, timeout in seconds for which a 204 answer is returned if the bot training has not finished yet.</td>
    <td>10</td>
  </tr> 

  <!-- Filesystem -->
  <tr>
    <td>FILESYSTEM_LOCATION</td>
    <td>Absolute path to the folder which will contain the bots</td>
    <td>api/bots/datas/</td>
  </tr>

  <!-- AWS S3 -->
  <tr>
    <td>AWS_LOCATION</td>
    <td>Absolute path to the folder which will contain the bots</td>
    <td>bots</td>
  </tr>
  <tr>
    <td>AWS_ACCESS_KEY_ID</td>
    <td>IAM access key ID</td>
    <td></td>
  </tr>
  <tr>
    <td>AWS_SECRET_ACCESS_KEY</td>
    <td>IAM access key</td>
    <td></td>
  </tr>
  <tr>
    <td>AWS_STORAGE_BUCKET_NAME</td>
    <td>S3 bucket name</td>
    <td></td>
  </tr>
</table>


## Microservice testing
Once you configured and started the microservice (following the generic guide) you can verify everything is in order.

  1. Create a bot:  

    ```bash
    curl --location 'http://localhost:8080/nluv1/bots' \
    --header 'Content-Type: application/json' \
    --data '{
        "nlu": "snips"
    }'
    ```

    If successful, a bot object including multiple fields should be received, keep safe the value of the following fields : `id`, `developer_token` and `client_token`.

  2. Talk with your bot:

    ```bash
    curl --location 'http://localhost:8080/nluv1/talk/{{id}}/en' \
    --header 'Authorization: Bearer {{client_token}}' \
    --header 'Content-Type: application/json' \
    --data '{
      "text": "Hello"
    }'
    ```

    As your bot has never been trained, it will train on empty data, it can take a few seconds to be ready. If your timeout variable is too low you might obtain a 204 response, it's ok you can retry in a few seconds.

    You should then receive an answer with the following format : 
    ```json
    {
        "input": "Hello",
        "intent": {
            "intentName": "Welcome Intent",
            "probability": 1
        },
        "slots": []
    }
    ```

  3. Delete your bot:

    You are good to go, you can delete your assistant: 
    ```bash
    curl --location --request DELETE 'http://localhost:8080/nluv1/bots/{{id}}/en' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer {{developer_token}}' \
    --data ''
    ```

Congratulations your service is up and running!

## Using from Prisme.ai

In order to use the microservice from the dedicated Prisme.ai app make sure to configure your prismeai-runtime instance with the following:
```yaml
- name: APP_CONFIG_NLU_apiUrl
  value: 'http://apps-prismeai-nlu.apps.svc.cluster.local:8080' # Your URL might be different depending on namespaces, port and such...
```