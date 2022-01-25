import { generateEndpoint } from "./urls";

it("should generate endpoint", () => {
  expect(generateEndpoint("42", "hello")).toBe(
    "http://localhost:3000/api/workspace/42/webhook/hello"
  );
});
