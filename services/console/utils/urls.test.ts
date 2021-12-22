import { generateEndpoint } from "./urls";

it("should generate endpoint", () => {
  expect(generateEndpoint("42", "hello")).toBe("/api/workspace/42/hello");
});
