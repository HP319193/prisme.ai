## Structure

Code base uses npm's workspaces functionality. Two folders contains workspaces : `services` and `packages`.

Root space propose common tools:

- Typescript tooling
- Rollup build recipe
- Jest tests config

Every sub projects will compile with typescript, run jest tests and bundle their index.ts into a unique bundle.

### Services

In this folder, we'll put all standalone projects : frontend apps and backend microservices.
Each should be independant, built separately, and quickly hosted.

### Packages

Packages are utilities or libraries aimed to be imported everywhere as NPM package. It may be a backend SDK or tool, typings, or
frontend components.

## Build

Packages are all built by Rollup, given the root `rollup.config.js` file **or** a custom `rollup.config.js` provided by the package project.  

Services uses their own build process as declared in their package.json. For example, **console** service is built using Nextjs while backend services are built by **typescript** (with a custom `tsconfig.json`).  

For Docker-based production deployments, all services also provide a `Dockerfile`.

## Tests

Run test with :

```
npm test
```

Every file name `*.test.t|jsx?` is run with Jest. [Read Jest documentation](https://jestjs.io/fr/docs/cli) to find
how to run only a few tests.

Tests must be as fast as possible. Each file should not take more than 200ms to run.

## Publishing

Each packages and services follow their own minor versions but a major version will be applied on every subprojects.
