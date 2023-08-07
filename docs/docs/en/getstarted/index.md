# Getting Started

Prismeai can be started in two ways :  

1. With docker only, including databases images (Elasticsearch, Redis, MongoDB)  
2. With a mix of Docker & NodeJS for a developer localhost environment

Both ways are meant for testing only and **not for a production setup**.  
In order to deploy Prismeai to a production ready environment, more robust tools like container orchestrators (i.e Kubernetes) must be used, enforcing horizontal scaling, monitoring, HTTPS, data encryption, ...

## Docker

### Requirements

**Dependencies :**  

* git
* Docker 20+
* docker-compose

**Hardware :**  

* Minimum disk space for docker images :  20GB+
* Minimum disk space for volumes : 5GB+, ideally 50GB
* Recommended specs : 4 vCPU / 16GB RAM
* Wildcard DNS pointing to the Docker host machine
    * Needed by pages URL which are built with the workspace slug as a subdomain

### Configuration 
1. git clone https://gitlab.com/prisme.ai/prisme.ai.git  
By default, the docker-compose.yml & .env files are configured to run on a local setup, served through 3 localhost DNS which we define in our /etc/hosts file.  
In order for the platform to be available from whatever online network, these domains would have to be reconfigured as described below.  
Databases-wise, this default local setup is also configured to use databases from the docker-compose.yml, using Docker network links and persisting data in the `data/` root directory.    
All available environment variables are [described here](https://docs.eda.prisme.ai/en/getstarted/configuration/).  

2. Open & edit the root .env file, configuring a few shared environment variables used by `docker-compose.yml`  :  

  * **PAGES_HOST** :  Pages wildcard domain, prefixed with a beginning dot.  
If **PAGES_HOST** = `.pages.local.prisme.ai:3100`, a page `dashboard` within a workspace `collections` will be available at `http[s]://collections.pages.local.prisme.ai:3100/dashboard`.  
Here, both `collections.pages.local.prisme.ai` and `anyOtherWorkspace.pages.local.prisme.ai` must point to the host docker machine IP through a wildcard DNS record like this one :  
```
*.pages.local.prisme.ai 10800 IN CNAME studio.local.prisme.ai.
# or ...
*.pages.local.prisme.ai 10800 IN A 100.100.100.100
```
Where either `studio.local.prisme.ai` DNS or 100.100.100.100 IP point to the host docker machine.  

  * **CONSOLE_URL** : Public URL serving the studio itself.  
On a single machine setup with Docker, this is just another domain pointing to the same IP as **PAGES_HOST** does, which could even be the same parent domain as **PAGES_HOST** since both services (Pages & Studio) will be served through different ports anyway.  
  * **API_URL** : Public URL serving the API, ended with /v2.  
Again, on a single machine setup with Docker, this is just another domain pointing to the same IP as **PAGES_HOST** and **CONSOLE_URL** do, served through a third port.    


### Start
```
docker-compose up
```  

Studio will be available at the defined **CONSOLE_URL**, by default http://studio.local.prisme.ai:3000  


## NodeJS

**Dependencies :**  

* NodeJS 16+
* npm 8+
* git 
* Docker 20+
* docker-compose

**Hardware :**  

* Minimum disk space for docker images :  15GB+
* Minimum disk space for volumes : 5GB+, ideally 50GB
* Recommended specs : 4 vCPU / 16GB RAM


### Start

If willing to change any part of this codebase, we recommand testing your updates live using our `npm start` script, which starts the services you want to change with NodeJS, and everything else with Docker :  
```
git clone https://gitlab.com/prisme.ai/prisme.ai.git  
npm install  
npm start  # Unselect services with spacebar & arrow keys in order to start them from NodeJS 
```  

The `npm start` will prompt whether you want to start services from build images or local repository using NodeJS.  

In order to run Prisme.ai from its official Docker images, make sure that all services have their box ticked & type 'Enter' : this will start each service (including databases) from their own `docker-compose.yml` (located in each `services/*` directory).  

If willing to develop or simply start using NodeJS, untick all services' boxes by pressing 'a' and 'Enter' : this will start databases using Docker, and individual services with their respective `npm run dev` command.  

Whether you started using Docker or NodeJS, all persistent data will be stored inside the `data/` directory at the root of your repository.  

By default, studio will be available at http://studio.local.prisme.ai:3000  
