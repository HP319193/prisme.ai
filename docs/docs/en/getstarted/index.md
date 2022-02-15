# Getting Started

## Docker
A `docker-compose.yml` file is located at the root of the repository, allowing you to start the whole project with a single docker-compose command :  
```
git clone https://gitlab.com/prisme.ai/prisme.ai.git  
docker-compose up
```

## For developpers : Docker + NodeJS
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
