# Hosting on Amazon Web Services

This hosting guide shows you how to self-host Prisme.ai on Amazon Web Services (AWS).  

We recommend using the [**Amazon Elastic Kubernetes Service (EKS)**](https://aws.amazon.com/eks/) to deploy Prisme.ai.  

## Follow the generic guide

You can follow the [**generic Kubernetes guide**](../kubernetes/index.md) and use this page as a reference for specific configuration regarding Amazon Web Services.  

## Credentials on AWS

!!! note

    Note that while deploying on AWS a few external service might not need a credentials configuration, such as : S3. This can be done using IAM, which will automatically expose the correct environment variables.
