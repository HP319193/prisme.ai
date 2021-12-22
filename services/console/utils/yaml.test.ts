import { getLineNumber } from "./yaml";

it("should get line number", () => {
  const yaml = `workflows:
  foo: foo
  bar: bar
`;
  expect(getLineNumber(yaml, "/workflows/foo")).toBe(2);
});

it("should get line number for complex yamls", () => {
  const yaml = `workflows:
  foo:
    hello: 'world'
triggers:
  foo:
    ba: bar`;
  expect(getLineNumber(yaml, "/triggers/foo")).toBe(5);
});
