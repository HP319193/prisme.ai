import AutomationManifest from "./AutomationManifest";
import renderer, { act } from "react-test-renderer";
import getLayout, { useAutomation } from "../layouts/AutomationLayout";
import useYaml from "../utils/useYaml";
import CodeEditor from "../components/CodeEditor";
import { YAMLException } from "js-yaml";

jest.mock("../layouts/AutomationLayout", () => {
  const mock: any = jest.fn();
  mock.automation = {};
  mock.setAutomation = jest.fn(
    (automation: any) => (mock.automation.value = automation)
  );
  mock.useAutomation = () => mock;
  return mock;
});
jest.mock("../utils/useYaml", () => {
  const mock = {
    toJSON: jest.fn((value: string) => ({})),
    toYaml: jest.fn((value: any) => ""),
  };
  return () => mock;
});
it("should render", () => {
  const root = renderer.create(<AutomationManifest />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should get layout", () => {
  AutomationManifest.getLayout(<div />);
  expect(getLayout).toHaveBeenCalled();
});

it("should init yaml", async () => {
  useAutomation().setAutomation({
    triggers: {
      foo: {
        events: ["bar"],
        do: "something",
      },
    },
    workflows: {
      something: {
        do: [
          {
            emit: {
              event: "pouet",
            },
          },
        ],
      },
    },
  });
  const root = renderer.create(<AutomationManifest />);
  await act(async () => {
    await true;
  });
  expect(useYaml().toYaml).toHaveBeenCalledWith({
    triggers: {
      foo: {
        events: ["bar"],
        do: "something",
      },
    },
    workflows: {
      something: {
        do: [
          {
            emit: {
              event: "pouet",
            },
          },
        ],
      },
    },
  });
});

it("should not update empty yaml", async () => {
  useAutomation().setAutomation({
    triggers: {},
    workflows: {},
  });
  const root = renderer.create(<AutomationManifest />);
  await act(async () => {
    await true;
  });
  await act(async () => {
    root.root.findByType(CodeEditor).props.onChange();
  });
  expect(useYaml().toJSON).not.toHaveBeenCalled();
});

it("should update yaml", async () => {
  useAutomation().setAutomation({
    triggers: {},
    workflows: {},
  });
  const root = renderer.create(<AutomationManifest />);
  await act(async () => {
    await true;
  });
  await act(async () => {
    root.root.findByType(CodeEditor).props.onChange(`
triggers:
  foo:
    events:
      - bar
    do: Something
workflows:
  something:
    do:
      - emit:
          event: pouet
`);
  });
  expect(useYaml().toJSON).toHaveBeenCalledWith(`
triggers:
  foo:
    events:
      - bar
    do: Something
workflows:
  something:
    do:
      - emit:
          event: pouet
`);
});

it("should generation anotations when failing to update yaml", async () => {
  useAutomation().setAutomation({
    triggers: {},
    workflows: {},
  });
  (useYaml().toJSON as jest.Mock).mockRejectedValue(
    new YAMLException("foo", {
      line: 42,
      position: 12,
      column: 2,
      name: "bar",
      snippet: "foo bar",
      buffer: "",
    })
  );
  const root = renderer.create(<AutomationManifest />);
  await act(async () => {
    await true;
  });
  await act(async () => {
    root.root.findByType(CodeEditor).props.onChange(`
triggers:
  foo:
    events:
      - bar
    do: Something
workflows:
  something:
    do:
      - emit:
          event: pouet
`);
  });
  const expectedAnnotations =
    root.root.findByType(CodeEditor).props.annotations;
  expect(expectedAnnotations).toEqual([
    {
      row: 42,
      column: 12,
      text: `foo in "bar" (43:3)

foo bar`,
      type: "error",
    },
  ]);
});

it("should build annotations on errors", async () => {
  useYaml().toYaml = async () => `workflows:
  foo:
    bar: bar
`;
  useAutomation().invalid = [
    {
      instancePath: "/workflows/foo",
      message: "error",
    },
  ] as any;

  const root = renderer.create(<AutomationManifest />);
  await act(async () => {
    await true;
  });
  expect(root.root.findByType(CodeEditor).props.annotations).toEqual([
    { row: 2, column: 0, text: "error", type: "error" },
  ]);
});
