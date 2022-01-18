## Structure

Code base uses npm's workspaces functionality. Two folders contains workspaces : `services` and `packages`.

Root space propose common tools:

- Typescript tooling
- Rollup build receipe
- Jest tests config

Every sub projects will compile typescript, run jest tests and bundle their index.ts into a unique bundle.

Software code is separated in two categories : Services and Packages.

### Services

In this folder, we'll put all standalone projects : frontend apps and backend microservices. Each of this project aims
to be executed as final resource and to be build to be quickly hosted.

### Packages

Packages are utilities or libraries aimed to be imported everywhere as NPM package. It may be a backend SDK or tool, or
frontend components.

## Building

Building uses a common way for Packages but Services uses their own process. Each package build with rollup. A common
configuration is applied when running `npm run build` command, but a package project can have its own `rollup.config.js`
file to override the default config. Packages will build in a `dist` folder in their own file space.

Services must have their own Dockerfile to be able to create a dist autonomous version ready to deploy.

## Testing

Tests are run by running :

```
npm test
```

Every file name `*.test.t|jsx?` will be run with Jest. [Read Jest documentation](https://jestjs.io/fr/docs/cli) to find
how to run only a few tests.

Tests must be the more quickly possible. A test file cannot take more than 200ms to run.

## Publishing

Each packages and services follow their own minor versions but a major version will be applied on every subprojects.
