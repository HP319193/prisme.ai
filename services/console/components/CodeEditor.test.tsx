import AceEditor, { IMarker } from "react-ace";
import CodeEditor from "./CodeEditor";
import renderer, { act } from "react-test-renderer";
import { Ace } from "ace-builds";
import { useRef } from "react";

it("should render", () => {
  const root = renderer.create(<CodeEditor mode="yaml" value="foo" />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should update value", () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <CodeEditor mode="yaml" value="foo" onChange={onChange} />
  );
  act(() => {
    root.root.findByType(AceEditor).props.onChange("bar");
  });
  expect(onChange).toHaveBeenCalledWith("bar");
});

it("should set completers", async () => {
  const completers: Ace.Completer[] = [
    {
      getCompletions: () => null,
    },
  ];
  let ref: any;
  const Container = () => {
    ref = useRef<AceEditor>(null);
    return (
      <CodeEditor ref={ref} mode="yaml" value="foo" completers={completers} />
    );
  };
  const root = renderer.create(<Container />);
  await act(async () => {
    await true;
  });
  const editor = ref.current.editor;
  expect(editor.completers).toContain(completers[0]);
  act(() => {
    root.unmount();
  });
  expect(editor.completers).not.toContain(completers[0]);
});

it("should have an auto completers on .", async () => {
  let ref: any;
  const Container = () => {
    ref = useRef<AceEditor>(null);
    return <CodeEditor ref={ref} mode="yaml" value="foo" />;
  };
  const root = renderer.create(<Container />);
  await act(async () => {
    await true;
  });
  const editor = ref.current.editor;
  jest.spyOn(editor, "execCommand");
  editor.execCommand("insertstring", ".");
  expect(editor.execCommand).toHaveBeenCalledWith("startAutocomplete");
});

it("should set shortcuts", async () => {
  const shortcuts: any[] = [
    {
      name: "foo",
    },
  ];
  let ref: any;
  const Container = ({ shortcuts }: any) => {
    ref = useRef<AceEditor>(null);
    return (
      <CodeEditor ref={ref} mode="yaml" value="foo" shortcuts={shortcuts} />
    );
  };
  const root = renderer.create(<Container />);
  await act(async () => {
    await true;
  });
  const editor = ref.current.editor;
  jest.spyOn(editor.commands, "addCommand");
  act(() => {
    root.update(<Container shortcuts={shortcuts} />);
  });
  expect(editor.commands.addCommand).toHaveBeenCalledWith({
    name: "foo",
  });
  editor.commands.addCommand.mockClear();
  act(() => {
    root.update(
      <Container
        shortcuts={[
          {
            name: "foo",
            bar: "foo",
          },
        ]}
      />
    );
  });
  expect(editor.commands.addCommand).not.toHaveBeenCalled();
});

it("should set markers", async () => {
  const markers: IMarker[] = [
    {
      className: "foo",
      endCol: 1,
      endRow: 1,
      startCol: 1,
      startRow: 1,
      type: "fullLine",
    },
  ];
  let ref: any;
  const Container = ({ markers }: any) => {
    ref = useRef<AceEditor>(null);
    return <CodeEditor ref={ref} mode="yaml" value="foo" markers={markers} />;
  };
  const root = renderer.create(<Container />);
  await act(async () => {
    await true;
  });
  const editor = ref.current.editor;
  jest.spyOn(editor.getSession(), "addMarker");
  act(() => {
    root.update(<Container markers={markers} />);
  });
  expect(editor.getSession().addMarker).toHaveBeenCalledWith(
    {
      end: {
        column: 1,
        row: 1,
      },
      start: {
        column: 1,
        row: 1,
      },
    },
    "foo",
    "fullLine"
  );
});
