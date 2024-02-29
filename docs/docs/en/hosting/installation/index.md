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
- A minimal Kubernetes cluster for Prisme.ai should have at least **3 nodes 4vCPU / 16GB**
- External services such as Elasticsearch, Redis or MongoDB can either be self-hosted or managed. We recommend using a managed solution, if you want to self-host those services, please check their official documentation.
- Services workspaces and runtime requires one of these document/object storage :  
  - Filesystem (either through a local directory or a Kubernetes PVC)  
  - S3 compatible object storage  
  - Azure Blob storage  
  
### Configuration of values.yml

- If default release name 'core' will be changed, update accordingly every names including "core-"  
- The core ingresses should be annotated with your cloud provider ingress controller annotations  
- All DNS, databases urls/credentials & PVC manifests should also be updated 

## Available guides

Currently available guides :  

- [Local deployment (Docker & npm)](./local/index.md)  
<!-- - [Amazon Web Services](./aws/index.md)  
- [Azure](./azure/index.md)  
- [Google Cloud](./gcp/index.md)   -->
- [OpenShift](./openshift/index.md)