# Roles & Policies  
Policies are the differents kind of permissions which can be granted to someone for a specific object. This is the smallest permissions granularity.  

Currently, the only supported policies are :  
- **create** : can **create** the given kind of object  
- **read** : can **read** **this** object  
- **update** : can **update** **this** object    
- **delete** : can **delete** **this** object    
- **manage_permissions** : can manage **permissions** of others **users** on **this** object + **this** object's API keys  
- **manage** : can do all of the above

API Keys are defined in these same terms of **policies** and **objects**.  
These policies must be assigned to a specific object / user pair.  
The only object types that support permissions are **workspaces** and **pages**.  

Using `/permissions` API, we can grant one of these policies to anyone on any object supporting permissions **and** for which we have **manage_permissions** policy.

We can also grant a **Role**, which is simply a set of policies.  
Depending on the [microservice's configuration](#implementation-configuration), **Roles** can also grant policies to other objects than the one for which the role is given.  

For example, a **Workspace Owner** automatically has all policies for **Pages** owned by this same **workspace**.

# Existing roles

## Owner
A Workspace **Owner** can :  
- Manage permissions + API keys  
- View all workspace events  
- Has full CRUD permissions on the workspace, installed apps & pages

## Editor
A Workspace **Editor** can :  
- View all workspace events except API key & permissions ones  
- Has CRUD permissions except delete on the workspace, installed apps & pages

# Implementation & Configuration

Roles, permissions & API Keys granting & validation is implemented by `@prisme.ai/permissions` packages, which provides generic helpers allowing each service to implement their custom authorization policies with minimal efforts.  

Each backend microservice keep this configuration inside a `src/permissions` folder.  
This folder has 2 main files :  
- `config.ts` :  declares the existing roles (i.e `owner`), subject types (i.e `workspace`) and the rules defining the allowed / forbidden interactions  
- `index.ts` :  Instantiates the `@prisme.ai/permissions` with the above configuration + a persistance Mongoose schema (optional, only if we want the package to handle the permissions persistance)

The `config.ts` can also specify an optional `customRulesBuilder` callback used to dynamically generate roles given an external payload, by returning the same kind of rules as present in `rbac` and `abac` fields.  
This is how api keys are created under the hood, with this callback mapping the api key settings to the corresponding rules which will be evaluated when validating this API Key against a given access request.  
For a more concrete example, see `services/events/src/permissions/config.ts`.
