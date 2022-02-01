// Make sure you can use "publicRuntimeConfig" within tests.
jest.mock("next/config", () => () => ({
  publicRuntimeConfig: {
    API_HOST: "http://localhost:3000/api",
    ENDPOINT:
      "http://localhost:3000/api/workspace/{{workspaceId}}/webhook/{{slug}}",
  },
}));

// For packages/permissions:
if (typeof window.TextEncoder === "undefined") {
  const { TextEncoder } = require("util");
  window.TextEncoder = TextEncoder;
}

if (typeof window.TextDecoder === "undefined") {
  const { TextDecoder } = require("util");
  window.TextDecoder = TextDecoder;
}
