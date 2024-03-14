## Installation prerequisites

Those two services works together : `prismeai-crawler` and `prismeai-searchengine`, if you wish to use one of them, you have to install the second one.  

They need access to:  
- An **ElasticSearch**, it can be the same as the one used for the core deployment  
- A **Redis**, the instance can be the same as the one used for the core deployment, however we recommending targeting a dedicated database  

## Environment variables
* REDIS_URL=redis://localhost:6379
* ELASTIC_SEARCH_URL=localhost  

**ELASTIC_SEARCH_URL** might be set to an empty string '', in which case no webpage content would be saved, thus deactivating searches.  

## Microservice testing
Once you configured and started the microservice (following the generic guide) you can verify everything is in order.

1. Create a searchengine :  

```bash
curl --location 'http://localhost:8000/monitor/searchengine/test/test' \
--header 'Content-Type: application/json' \
--data '{
    "websites": [
        "https://docs.eda.prisme.ai/en/workspaces/"
    ]
}'
```

If successful, a complete searchengine object including an id field should be received.  

2. After a few seconds, look at the crawl history:  

```bash
curl --location --request GET 'http://localhost:8000/monitor/searchengine/test/test/stats' \
--header 'Content-Type: application/json' \
--data '{
	"urls":  ["http://quotes.toscrape.com"]
}'
```

The fields `metrics.indexed_pages` and `metrics.pending_requests` should be greater than 0, and pages already indexed should appear in `crawl_history`. 

3. Try a search:  

```bash
curl --location 'http://localhost:8000/search/test/test' \
--header 'Content-Type: application/json' \
--data '{
	"query": "workspace"
}'
```
In the answer, a `results` table should indicate one or more pages of the https://docs.eda.prisme.ai documentation dealing with workspaces.

Congratulations, you service is up and running!