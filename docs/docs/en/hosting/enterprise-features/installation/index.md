## Self-hosting Apps microservices

Depending on your subscribed licence you might have access to additional micro services which are used by specific Apps (Custom Code, Crawler, AI-Knowledge...).  
We will cover their deployment in this section.  

!!! info "Access"

    You will need a valid Gitlab username and token in order to follow the next steps and be able to fetch the Docker images.  
    If you don't have them yet, please reach out to the support in order to retrieve them ([support@prisme.ai](mailto:support@prisme.ai)).   
    <!-- It should be a Gitlab Deploy Token -->

We will deploy the apps microservices in the same cluster as the core microservices. Although, we recommend using a different namespace name.

### Prerequisites

Depending on the microservices you wish to install you might have different prerequisites to fulfill, we encourage you to check each service with it's corresponding prerequisites (example: [prismeai-llm](../configuration/prismeai-llm/index.md#installation-prerequisites), [prismeai-crawler](../configuration/prismeai-crawler/index.md#installation-prerequisites) or [prismeai-functions](../configuration/prismeai-functions/index.md#installation-prerequisites))


### Retrieve the Helm charts

Download the Prisme.ai Helm charts repository or add it as a Helm repo.

#### Option 1: Downloading the charts

Download the example Helm chart from the following address :  https://helm.prisme.ai/charts/prismeai-apps/prismeai-apps-0.1.0.tgz

#### Option 2: Adding as a Helm repo

```sh
helm repo add prismeai https://helm.prisme.ai/charts
helm repo update
```

Initiate the chart values file :  

```sh
helm show values prismeai/prismeai-apps > ./values.yml  
```


### Configure values.yaml

On your device, modify the `values.yaml` to include the connection details and credentials for the required external services depending on the services you wish to deploy.  
It is important that each database are correctly configured.

### Deploy using Helm
We recommend deploying the microservices in a different namespace than the core microservices. We will create a new namespace named `apps`. 

```sh
kubectl create namespace apps
```

#### Option 1 : Charts downloaded
From the root of the directory (`./prismeai-apps`) execute the installation command :  

```sh
helm install apps . --namespace apps -f values.yaml 
```

#### Option 2 : Added as a repo
```sh
helm install apps prismeai/prismeai-apps --namespace apps -f values.yaml
```

### Test the microservices
Once up and running you should test the different microservices by following their specific documentation ([prismeai-crawler and prismeai-searchengine](../configuration/prismeai-crawler/index.md#microservice-testing), [prismeai-functions](../configuration/prismeai-functions/index.md#microservice-testing), [prismeai-llm](../configuration/prismeai-llm/index.md#microservice-testing)).
