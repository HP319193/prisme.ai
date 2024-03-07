# LLM Open Source

The `prismeai-llm` microservice uses [LocalAi](https://github.com/go-skynet/LocalAI), with the pre-built image available here : `quay.io/go-skynet/local-ai`.

## Installation prerequisites

This service need access to:  
- A volume on which you can load the models to use  

You can learn more about [installing the  models in the next section](#installing-models).

## Installing models

You will need to provide some files in the `./models` directory
(relative to your installation method), for each model:  
- A .yaml file describing the model  
- A .tmpl file for the prompt format of the model  
- GGUF (CPU-compatible) file containing the model  

For embeddings models, you won't need a .tmpl file.  

Examples for mistral, however you will need to download two additional files and place them in the `./models` folder.   
A download_model.sh is in the `./models` folder.   
- Mistral-7B-Instruct-v0.2-GGUF from https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_0.gguf?download=true  


Some embeddings model can be used as .gguf like LLM, but other like MPNET requires to git clone a repository.
MPNET provides way better results than bert.  
- clone into your models folder `git clone https://huggingface.co/sentence-transformers/multi-qa-mpnet-base-dot-v1`  
- Replace the path in the mpnet.yaml file to match the cloned directory  


The files should have the following names :  
- multi-qa-mpnet-base-dot-v1  
- Mistral-7B-Instruct-v0.2-GGUF  

You can try more "compressed" versions of these model. Q8 is less compressed and Q4 is more compressed,
leading to less accurate results but faster generation. Note that the gguf files are for CPU inference for proof of concept before dedicating to GPU. GPU will be miles ahead, able to reach chat-gpt speed on a 4090 or A100 (models have differing speed).  

On Using 16 CPU on our early tests, using big prompts with a lot of context you can expect 3 minutes for Phi-2 and 10 from Mistral 7b. These models can handle up to 4096 tokens of context + generated text.  

To add a new model or modify the configurations, follow the documentation here: https://localai.io/advanced/
This documentation can be summarized to :  
- Find a model on huggingFace  
- click on the download icon for the file and copy the link, in your machine download it in the /model section using
`curl -L urlWithModelName -O modelName`  
- Then find the appropriate template to use here https://github.com/go-skynet/model-gallery and copy it in the /models folder along the model.  
- Restart the service to be able to use it  

## Microservice testing
You can call your API with the following query to test. You can use "orca" or "airoboros" if using
the provided examples.

```bash
curl http://localhost:8080/v1/chat/completions -X POST -H "Content-Type: application/json" -d '{
     "model": "phi-2",
     "messages": [{
     	"role": "user",
     	"content": "Give me a random number."
     }],
     "temperature": 0.7,
     "max_token": 10,
     "stream": true
}'
```

To test the embeddings, you can call the following:  
```bash
curl http://localhost:8080/v1/embeddings -H "Content-Type: application/json" -d '{                                                                                                                                                 
     "model": "bert",
     "input": "A long time ago in a galaxy far, far away"
   }'
```

## Troubleshooting

To debug the product if you don't receive any response after a long time (10+ minutes for the first inference)
you can run the docker-compose with the `DEBUG: true` environment variable. This will provide useful
logs to sends us.  

Please note that when ran locally the LLM is expected to be really slow. For reference, on a macbook M2
the docker image can generate 1 token every 7 seconds for the above requests.  


## Usage on the Prisme.ai AI Knowledge

To use these LLM on the Prisme.ai Knowledge, in the project settings, you should specify the correct model names
for text generation and embeddings. In the first model field enter either "orca" or "airoboros", and
in the model-embeddings fields "bert" or "mpnet".

If you want to test change the embedding models of an AI:Knowledge project, you will have use another project. This is because the
embeddings does not have the same vector size, which are used by redis for indexation.
