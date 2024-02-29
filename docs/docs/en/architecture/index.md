# Microservices

## Architecture

![image](/assets/images/architecture/microservices.png)

## Scalability
The above architecture can easily scale up accross multiple instance for each service, and over multiple machines.  
For this, 3 conditions must be kept true :  

* All instances can access the broker  
* prismeai-workspaces and prismeai-events have the same document database instance  
* prismeai-workspaces and prismeai-runtime have the same file storage instance 

From there and thanks to the shared broker, events processing will automatically be distributed accross instances.  
**However**, input HTTP requests like automation webhooks require a load balancer to be setup in order for these requests to be distributed accross all instances.  

## API Gateway

This is the only public endpoint of the architecture.  
The API Gateway enforces authentication, authorization (on API level only), rate limits and others policies on incoming requests before dispatching them to the right micro service.  

**As only the API Gateway enforces authentication, every other backend microservices must be securely kept inside a private & trusted network**.  
Other backend microservices will rely on a `x-prismeai-user-id` header (automatically set by api-gateway) when needing access to authenticated user identity.  
[More details on Authentication & Authorization](./authentication_access_control)

**Required databases :**  

* **Document database** : Stores user accounts & their API level permissions (i.e can access events API, workspaces API, ...)  
* **Distributed cache** : Stores currently active session tokens

## prisme.ai-events

**prisme.ai-events** is the interface between the message broker and external consumers / producers.  
More specifically, **prisme.ai-events** is in charge of :

* Enabling the consumption of events from an external service in web socket or HTTP long polling
* Allowing the emission of events from an external service in web socket or HTTP long polling
* Historization (storage in a data lake) of each event handled by the message broker
* Searching for events through various filters directly from the data lake

**Required databases :**  

* **Document database** : Same instance as [prisme.ai-workspaces](#prismeai-workspaces) in order to read workspace-level roles & permissions  
* **Datalake** : Stores events for long-term history

## prisme.ai-runtime

**prisme.ai-runtime** service is in charge of the workspaces execution depending on declared triggers, such as : events, dates or HTTP.

**Required databases :**  

* **Distributed cache** : Stores execution contexts (i.e automation variables as **global**, **user** and **session**)  
* **File storage** : Same instance as [prisme.ai-workspaces](#prismeai-workspaces), containing existing workspaces

## prisme.ai-workspaces

**prisme.ai-workspaces** service is in charge of workspace edition : CRUD operations on a workspace, CRUD on one of its automation or installation/configuration of an app.

**Required databases :**  

* **Document database** : Stores workspace-level roles & permissions  
* **File storage** : Stores workspaces

## Message Broker

The message broker allows every internal micro service to communicate with each other, as well as providing **automations** & **apps** with their messaging capability through **triggers**, and **emit / wait** instructions.
It might by any well-known broker such as Kafka, RabbitMQ, Redis ...

Internal micro services uses the @prisme.ai/broker npm package in order to stay "broker
technology" agnostic and ease broker replacement.

However, **Redis 5.0** is the only supported broker currently.
