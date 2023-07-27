# Prisme.ai SDk

## Description

This javascript library helps to communicate with Prisme.ai API. It provides methods to reach every endpoints and structure data responses.

## Usage

```
import api from '@prisme.ai/sdk';
```

will give you a singleton preset to hit the prisme.ai cloud service.

You can set a different host by instantiating the Api class:

```
import { Api } from '@prisme.ai/sdk';
const api = new Api({
  host: 'https://my.custom.host'
})
```

You are able to call un authentified methods like signin or signup, but you'll need a valid token to call the other. Just set its property:

```
api.token = 'the token';
```
