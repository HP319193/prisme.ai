# Hosting using OpenShift

This hosting guide shows you how to self-host Prisme.ai on OpenShift.  

???+ warning
    
    This guide is currently in construction, you can expect inaccuracies and missing parts. If you find some, please do not hesitate to [reach out to support@prisme.ai](mailto:support@prisme.ai). 

This guide assumes that you have a basic understanding of Kubernetes, Helm, and the various external services required by Prisme.ai.

## Prerequisites


## Prepare the external services

Deploy the required external services either within your Kubernetes cluster or make sure they are accessible to the cluster if hosted externally.

- MongoDB: Deploy a MongoDB instance or cluster and note down the connection string.
- Elasticsearch: Set up an Elasticsearch cluster and note down the connection details.
- Redis: Deploy a Redis instance and configure it for both caching and message brokering, or deploy separate instances for each purpose.
- File Storage: Configure your chosen file storage solution and obtain the necessary access credentials.

## Create a cluster

Create a new Kubernetes cluster.  
Make sure you have access to it using `kubectl` from your device.  

## Install Prisme.ai with Helm
Clone the Prisme.ai Helm chart repository or add it as a Helm repo.  

### Option 1: Cloning the charts

Clone the example Helm chart from the following address : https://gitlab.com/prisme.ai/prisme.ai/-/tree/main/docs/charts-examples/prismeai-core.  

On your device, modify the `values.yaml` to include the connection details and credentials for the external services prepared in Step 1.  
It is important that each database are correctly configured, report to the [environment variables table](../../configuration/environment-variables.md) if you have any doubt.   

Once you are ready: using a terminal, place yourself in the folder containing the main `values.yaml`.  
Create a namespace for Prisme.ai and install the platform using the Helm chart:  

```sh
kubectl create namespace core
helm install --namespace core -f values.yaml .
```

### Option 2: Adding as a Helm repo

!!! warning

    This option is not available yet.

Customize the values.yaml file to include the connection details and credentials for the external services prepared in Step 1.  

```sh
helm repo add prismeai https://charts.prisme.ai
helm repo update
```

Create a namespace for Prisme.ai and install the platform using the Helm chart:

```sh
kubectl create namespace core
helm install core prismeai/prismeai-chart --namespace core -f values.yaml
```

## Verify the Deployment
Verify that all Prisme.ai services are running correctly by checking the pod status and logs:  

```sh
kubectl get pods --namespace core
kubectl logs <pod-name> --namespace core
```

Ensure that the services can communicate with the external services and that there are no connectivity issues.

## Set Up Ingress (Optional)
If you want to expose Prisme.ai to the internet, set up an Ingress controller and define Ingress rules for routing traffic to the Prisme.ai services.

## Ongoing Maintenance
Regularly back up your MongoDB and Elasticsearch data. Monitor the health of the Prisme.ai services and the external services. Apply updates to Prisme.ai and its dependencies as needed.

You have now successfully self-hosted the Prisme.ai platform on your Kubernetes cluster. Ensure that you follow best practices for security, backups, and monitoring to maintain a stable and secure environment for your applications.

Remember that this guide provides a high-level overview, and you may need to adjust the steps based on your specific environment and requirements.