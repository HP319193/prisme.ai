import {
  findParameter,
  findParent,
  getLineNumberFromPath,
  getLines,
} from "./yaml";

it("should get lines", () => {
  const yaml = `workflows:
  foo: foo
  bar: bar`;
  expect(getLines(yaml)).toEqual([
    { line: 1, indent: 0, name: "workflows", value: "" },
    { line: 2, indent: 1, name: "foo", value: "foo" },
    { line: 3, indent: 1, name: "bar", value: "bar" },
  ]);
});

it("should get line number", () => {
  const yaml = `workflows:
  foo: foo
  bar: bar
`;
  expect(getLineNumberFromPath(yaml, "/workflows/foo")).toBe(2);
});

it("should get line number for complex yamls", () => {
  const yaml = `workflows:
  foo:
    hello: 'world'
triggers:
  foo:
    ba: bar`;
  expect(getLineNumberFromPath(yaml, "/triggers/foo")).toBe(5);
});

it("should get line number by indent and parameter", () => {
  const yaml = `workflows:
  foo:
    hello: 'world'
triggers:
  foo:
    ba: bar
  bar:
    endpoint: true
    do: it
  hello:
    endpoint: world
    do: it
  noop:
    events:
      - noop
    do: not
`;
  expect(findParameter(yaml, { indent: 2, parameter: "endpoint" })).toEqual([
    { line: 8, indent: 2, name: "endpoint", value: "true" },
    { line: 11, indent: 2, name: "endpoint", value: "world" },
  ]);
});

it("should get parent line", () => {
  const yaml = `workflows:
  foo:
    hello: 'world'
triggers:
  foo:
    ba: bar
  bar:
    endpoint: true
    do: it
  hello:
    endpoint: world
    do: it
  noop:
    events:
      - noop
    do: not
`;
  expect(findParent(yaml, 3)).toEqual({
    line: 2,
    indent: 1,
    name: "foo",
    value: "",
  });
});

it('should get grand paernt line',  () => {
  const yaml = `a:
  b:
    c:
      d: e
  `
  expect(findParent(yaml, 4, 1)).toEqual({
    line: 3,
    indent: 2,
    name: 'c',
    value: ''
  })
  expect(findParent(yaml, 4, 2)).toEqual({
    line: 3,
    indent: 2,
    name: 'c',
    value: ''
  })
})
