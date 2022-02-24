# Roles & Policies  
Policies are the differents kind of permissions which can be granted to someone for a specific object. This is the smallest permissions granularity.  

Currently, the only supported policies are :  

* **create** : can **create** the given kind of object  
* **read** : can **read** **this** object  
* **update** : can **update** **this** object    
* **delete** : can **delete** **this** object    
* **manage_permissions** : can manage **permissions** of others **users** on **this** object, can manage **this** object's API keys  
* **manage** : can do all of the above

API Keys are defined in these same terms of **policies** and **objects**.  
These policies must be assigned to a specific object / user pair.  
The only object types that support permissions are **workspaces** and **pages**.  

Using `/permissions` API, we can grant one of these policies to anyone on any object supporting permissions **and** for which we have **manage_permissions** policy.

We can also grant a **Role**, which is simply a set of policies.  
Depending on the [microservice's configuration](../../architecture/authentication_access_control/#authorization-configuration), **Roles** can also grant policies to other objects than the one for which the role is given.  

For example, a **Workspace Owner** automatically has all policies for **Pages** owned by this same **workspace**.

# Existing roles

## Owner
A Workspace **Owner** can :  

* Manage permissions + API keys  
* View all workspace events  
* Has full CRUD permissions on the workspace, installed apps & pages  
* Publish the workspace as a new app release and delete this app  

## Editor
A Workspace **Editor** can :  

* View all workspace events except API key & permissions ones  
* Has CRUD permissions except delete on the workspace, installed apps & pages  
* Publish a new app release if the workspace has already been published by an Owner

# API Keys  
Anyone with **manage_permissions** policy on a workspace (i.e `Owner`s) can create an API Key for this workspace, automatically granting some permissions to whatever requests including this API Key inside the `x-prismeai-api-key` header.  
For now, the only supported permissions with **API Keys** are the reading & creation of specific events types.  

For instance, any API Key created with this payload will grant `read` and `create` policies on `workspaces.*` and `apps.someApp.someSpecificEvent` events :  
```
{
  "events": [
      "apps.someApp.someSpecificEvent",
      "workspaces.*"
  ]
}
```  

The global wildcard `*` could also be given in order to have an API Key with access to all of this workspace's events.  
