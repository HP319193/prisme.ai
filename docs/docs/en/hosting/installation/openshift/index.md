# Hosting using OpenShift

This hosting guide shows you how to self-host Prisme.ai on OpenShift.  

This guide assumes that you have a basic understanding of Kubernetes, Helm, and the various external services required by Prisme.ai.

## Follow the generic guide

You can follow the [**generic Kubernetes guide**](../kubernetes/index.md) and use this page as a reference for specific configuration regarding Amazon Web Services.  

## While configuring values.yaml

A few things that you might want to check out while deploying on OpenShift: 
- Your services might not have the right to be exposed on port 80, you might have to override them
- You might not have the rights to deploy in `kube-system`, it is OK to change the namespace