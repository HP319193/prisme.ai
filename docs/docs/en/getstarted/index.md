# Getting Started

To install Prisme.ai, first make sure that `git`, `npm`, `docker` and `NodeJS` (**only for NodeJS start**) are installed on your system.  

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
