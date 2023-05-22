# Authentication

Authentication is enforced by the api-gateway which validates session cookies / headers, & adds a `x-prismeai-user-id` header to the request before forwarding it to the target microservice. Thus, other backend microservices do not enforce any authentication mechanism & rely on this `x-prismeai-user-id` header when needing access to the authenticated user id.  Therefore, these backend microservices must be securely kept inside a private & trusted network.  

The API Gateway will reject un-authenticated requests **only if the target API is protected by an authentication** policy inside the `gateway.config.yml`.  

**runtime** microservice automatically pulls authenticated sessions (through **gateway.login.succeeded** events) to fill [**user**](../workspaces/automations#user) and [**session**](../workspaces/automations#session) context variables when processing input [**endpoints**](../workspaces/automations#url) or [**events**](../workspaces/automations#events).

# Authorization

Although API Gateway is the only authentication keeper, each backend microservice can manage its own permissions system (using `@prisme.ai/permissions` package), with their own custom roles & policies.  

For instance, when accessing a specific workspace, `prisme.ai-workspaces` service will check that authenticated user (given by `x-prismeai-user-id` header) has a `read` policy on the target object. This `read` policy might be granted in different ways : specific **policy** attribution, **role**, or with an **API Key**.  
[More details on Permissions & API Keys](../../getstarted/permissions/)



# Authorization configuration

Roles, permissions & API Keys are implemented by `@prisme.ai/permissions` package, which provides generic helpers allowing each service to implement their custom authorization policies with minimal efforts.  

Each backend microservice keep this configuration inside a `src/permissions` folder.  
This folder has 2 main files :  
- `config.ts` :  declares the existing roles (i.e `owner`), object types (i.e `workspace`) and the rules defining the allowed / forbidden interactions  
- `index.ts` :  Instantiates the `@prisme.ai/permissions` with the above configuration + a persistance Mongoose schema (optional, only if we want the package to handle the permissions persistance)
