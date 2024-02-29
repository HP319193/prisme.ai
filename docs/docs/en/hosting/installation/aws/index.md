# Hosting on Amazon Web Services

This hosting guide shows you how to self-host Prisme.ai on Amazon Web Services (AWS).  

!!! warning
    
    This guide is currently in construction, you can expect inaccuracies and missing parts. If you find some, please do not hesitate to [reach out to support@prisme.ai](mailto:support@prisme.ai). 

This guide assumes that you have a basic understanding of Kubernetes, Helm, and the various external services required by Prisme.ai.

While AWS provides different suitable ways to host Prisme.ai, in this guide we will be using [EKS](https://aws.amazon.com/eks/).  

## Create a cluster  

Use the eksctl tool to create a cluster specifying a name and a region with the following command:

```sh
eksctl create cluster --name prismeai --region <your-aws-region>
```

This can take a while to create the cluster.

Once the cluster is created, eksctl automatically sets the kubectl context to the cluster.