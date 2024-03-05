## Installation prerequisites

Those two services works together : `prismeai-crawler` and `prismeai-searchengine`, if you wish to use one of them, you have to install the second one.  

They need access to:  
- An **ElasticSearch**, it can be the same as the one used for the core deployment  
- A **Redis**, the instance can be the same as the one used for the core deployment, however we recommending targeting a dedicated database  

### Activate notifications on redis :  
Notifications should be enabled on the Redis instance, this can be done in different ways, here is an example using the redis-cli:

```sh
redis-cli config set notify-keyspace-events KEA
```

## Environment variables :  
* REDIS_URL=redis://localhost:6379
* ELASTIC_SEARCH_URL=localhost  

**ELASTIC_SEARCH_URL** might be set to an empty string '', in which case no webpage content would be saved, thus deactivating searches.  

