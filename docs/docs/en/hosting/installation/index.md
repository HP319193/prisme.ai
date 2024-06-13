# Installation

## Introduction   

You can install Prisme.ai on any platform using Docker.  
You can also follow one of our guides to install Prisme.ai on popular hosting platforms, these installations are often more production oriented.  

We recommend using Kubernetes with Helm while deploying our platform.  
Also, before deploying our platform, we strongly advise to familiarize yourself with it's architecture in order to understand the different microservices required as well as the different types of databases needed.  
The architecture can be reviewed [here](../../architecture/index.md).  


## General considerations  

### Provision required cloud provider resources :
- A load balancer with ingress controller capabilities. Other load balancing methods might be used but are not documented here
- A minimal Kubernetes cluster for Prisme.ai should have **at least** **3 nodes 4vCPU / 16GB**, this configuration is suitable to run a smooth **core** installation. If your installation includes microservices from the [enterprise features](../enterprise-features/installation/index.md#prerequisites) you may need more depending on the additional microservices. 
- Databases : Elasticsearch 7+ , Redis 5+, MongoDB 4+
  - We recommend using a managed solution, if you want to self-host those services, please check their official documentation.
- For [enterprise features](./enterprise-features/installation/) :
    - a Redis with SEARCH and JSON modules is needed (included by `redis/redis-stack-server` docker image)
    - a RWX Kubernetes volume (50GB minimum, we do not recommend using NFS)
- Services workspaces and runtime requires one of these document/object storage :  
    - Filesystem (Kubernetes PVC that supports RWX, 50GB minimum)  
    - S3 compatible object storage  
    - Azure Blob storage  
    <!-- - Google Storage -->
- Workspaces pages routing require a **wildcard dns**  
- Cluster machines date must remain synchronized within 10 seconds of each other

### Offline environments
If the installation environment does not have access to internet, ensure that the following prerequisites are always met :  

* If using [app microservices](./enterprise-features/installation/), `prismeai-functions` need access to a NPM registry. If the default https://registry.npmjs.org/ is not available, you must configure your own npm registry using **NPM_CONFIG_REGISTRY** environment variable inside `prismeai-functions` microservice
    * Depending on your NPM proxy, it might require additional configuration for authentication
* If using internal / self-signed TLS certificates, they must be configured inside almost all microservices to avoid HTTPS errors
    * `prismeai-searchengine` and `prismeai-crawler` are Python microservices : once mounted, the certificate file location can be configured with [REQUESTS_CA_BUNDLE](https://requests.readthedocs.io/en/latest/user/advanced/#ssl-cert-verification)
    * `prismeai-llm` does not need the custom certificate
    * Every other `prismeai-*` services are NodeJS : once mounted, the certificate file location can be configured with [NODE_EXTRA_CA_CERTS](https://nodejs.org/docs/latest-v4.x/api/cli.html#cli_node_extra_ca_certs_file)

  
## Available guides

Currently available guides :  

- [Docker or npm (locally oriented))](./local/index.md) 
- [Kubernetes & Helm (Generic)](./kubernetes/index.md)
    - [Amazon Web Services](./aws/index.md)  
    - [Azure](./azure/index.md)  
    - [Google Cloud](./gcp/index.md)  
    - [OpenShift](./openshift/index.md)
