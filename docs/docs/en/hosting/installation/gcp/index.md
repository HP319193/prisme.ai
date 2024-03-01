# Hosting on Google Cloud

This hosting guide shows you how to self-host Prisme.ai on Google Cloud Platform (GCP).  

We recommend using the [**Google Kubernetes Engine (GKE)**](https://cloud.google.com/kubernetes-engine) to deploy Prisme.ai.

## Follow the generic guide

You can follow the [**generic Kubernetes guide**](../kubernetes/index.md) and use this page as a reference for specific configuration regarding Amazon Web Services.  

## While creating a cluster

!!! info
    
    By default a Google Cloud Cluster is restricted to a set of IP address, make sure you have added yours using the cluster's "Control plane authorized networks"

## While configuring values.yaml

A few things that you might want to check out while deploying on Google Cloud : 
- You might not have the rights to deploy in `kube-system`, it is OK to change the namespace if needed.
