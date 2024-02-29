# Self-hosting Prisme.ai

This section provides guidance on setting up and hosting Prisme.ai.

## Local development  

For development purposes, Prisme.ai can be started in two ways:  

1. With docker only, including databases images (Elasticsearch, Redis, MongoDB)  
2. With a mix of Docker & NodeJS for a developer localhost environment

Both ways are meant for testing only and **not for a production setup**.  

For more information about the local development see the [dedicated local installation](./installation/local/index.md).

## Production hosting  

In order to deploy Prisme.ai to a production ready environment, more robust tools like container orchestrators (i.e Kubernetes) must be used, enforcing horizontal scaling, monitoring, HTTPS, data encryption...  

You can learn more about production setup hosting Prisme.ai in the [installation part](./installation/index.md).