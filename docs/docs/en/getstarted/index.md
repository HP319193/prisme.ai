# Getting Started

## Requirements

**Docker only :**  

Dependencies : 
- git
- Docker 20+
- docker-compose

Machine :  
- Minimum disk space for docker images :  15GB+
- Minimum disk space for volumes : 5GB+, ideally 50GB
- Recommended specs : 4 vCPU / 8GB RAM
- Wildcard DNS pointing to the Docker host machine
  - Needed by pages URL which are built with the workspace slug as a subdomain

**For developers :**
- NodeJS 16+
- npm 8+

## Docker

**Configuration :**  
1. git clone https://gitlab.com/prisme.ai/prisme.ai.git  
By default, the docker-compose.yml & .env files are configured to run on a local setup, served through 3 localhost DNS which we define in our /etc/hosts file.  
In order for the platform to be available from whatever online network, these domains would have to be reconfigured as described below.  
Databases-wise, this default local setup is also configured to use databases from the docker-compose.yml, using Docker network links and persisting data in the `data/` root directory.    
All available environment variables are [described here](https://docs.eda.prisme.ai/en/getstarted/configuration/).  

2. Open & edit the root .env file, configuring a few shared environment variables used by `docker-compose.yml`  :  
- **PAGES_HOST** :  Pages wildcard domain, prefixed with a beginning dot.  
If **PAGES_HOST** = `.pages.local.prisme.ai:3100`, a page `dashboard` within a workspace `collections` will be available at `http[s]://collections.pages.local.prisme.ai:3100/dashboard`.  
Here, both `collections.pages.local.prisme.ai` and `anyOtherWorkspace.pages.local.prisme.ai` must point to the host docker machine IP through a wildcard DNS record like this one :  
```
*.pages.local.prisme.ai 10800 IN CNAME studio.local.prisme.ai.
# or ...
*.pages.local.prisme.ai 10800 IN A 100.100.100.100
```
Where either `studio.local.prisme.ai` DNS or 100.100.100.100 IP point to the host docker machine.  

- **CONSOLE_URL** : Public URL serving the studio itself.  
On a single machine setup with Docker, this is just another domain pointing to the same IP as **PAGES_HOST** does, which could even be the same parent domain as **PAGES_HOST** since both services (Pages & Studio) will be served through different ports anyway.  
- **API_URL** : Public URL serving the API.  
Again, on a single machine setup with Docker, this is just another domain pointing to the same IP as **PAGES_HOST** and **CONSOLE_URL** do, served through a third port.    


**Start :**  
```
docker-compose up
```

## For developers : Docker + NodeJS
If willing to change any part of this codebase, we recommand testing your updates live using our `npm start` script, which starts the services you want to change with NodeJS, and everything else with Docker.  
In order to do so, please make sure that `git`, `npm`, `docker` and `NodeJS 16` (**only for NodeJS start**) are installed on your system.  

Then, you can type the following commands :  
```
git clone https://gitlab.com/prisme.ai/prisme.ai.git  
npm install  
npm start  # Type 'Enter' for Docker-mode or 'a' then 'Enter' for local NodeJS start  
```  

The `npm start` will prompt whether you want to start services from build images or local repository using NodeJS.  

In order to run Prisme.ai from its official Docker images, make sure that all services have their box ticked & type 'Enter' : this will start each service (including databases) from their own `docker-compose.yml` (located in each `services/*` directory).  

If willing to develop or simply start using NodeJS, untick all services' boxes by pressing 'a' and 'Enter' : this will start databases using Docker, and individual services with their respective `npm run dev` command.  

Whether you started using Docker or NodeJS, all persistent data will be stored inside the `data/` directory at the root of your repository.
