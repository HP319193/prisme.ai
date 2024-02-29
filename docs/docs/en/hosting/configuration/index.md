# Configuration

Prisme.ai services can be configured through various environment variables.  

To access a comprehensive listing of available configurations, please refer to the section on [environment variables](./environment-variables.md).

In a **docker** setup, you can tune these variables inside the root `docker-compose.yml` file ([docker-compose configuration](https://docs.docker.com/compose/environment-variables/)).  

In a **developer** setup, you can create a `services/*/.env` file containing key / values pairs as follows :  
```
WORKSPACES_STORAGE_TYPE=S3_LIKE
WORKSPACES_STORAGE_S3_LIKE_BUCKET_NAME=someBucketName
...
```  
Then, for when you want to run this service directly from its docker image, you can also add an `env_file` option to its `services/*/docker-compose.yml` file :  
```yaml
  console:
    entrypoint: npm start  --prefix services/console
    restart: on-failure
    image: registry.gitlab.com/prisme.ai/prisme.ai/prisme.ai-console:latest
    ports:
      - '3000:3000'
    env_file: ./.env
```

