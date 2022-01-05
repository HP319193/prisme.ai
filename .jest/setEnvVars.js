// Make sure you can use "publicRuntimeConfig" within tests.
jest.mock("next/config", () => () => ({
  publicRuntimeConfig: {
    API_HOST: "http://localhost:3000/api",
    ENDPOINT: "workspace/{{workspaceId}}/{{slug}}",
  },
}));
