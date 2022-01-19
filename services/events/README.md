# Prisme.ai Events

## Getting Started

First, run the development server:

```bash
npm run dev
```

By default, prisme.ai-events listens on 3030 port and handles following features :  
- Event sending  
- Events listening websocket
- Events longpoll 
- Events storage in a datalake
- Events search (via datalake)

## Environement

You can set the following env variables to customize your installation.  

- BROKER_HOST: Message broker host
- OPENAPI_FILEPATH: Filepath to the OpenAPI file describing HTTP endpoints and supported events
- EVENTS_STORAGE_DRIVER: Events storage driver (supported drivers: 'elasticsearch')
- EVENTS_STORAGE_ES_HOST: Elasticsearch host
- EVENTS_STORAGE_ES_USER: Elasticsearch user
- EVENTS_STORAGE_ES_PASSWORD: Elasticsearch password