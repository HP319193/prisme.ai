import WorkspaceSource from "./WorkspaceSource";
import renderer, { act } from "react-test-renderer";
import { useWorkspace, WorkspaceContext } from "../layouts/WorkspaceLayout";
import useYaml from "../utils/useYaml";
import CodeEditor from "../components/CodeEditor/lazy";
import { YAMLException } from "js-yaml";
import { validateWorkspace } from "@prisme.ai/validation";
import { useToaster } from "../layouts/Toaster";

jest.mock("../utils/useYaml", () => {
  const toJSON = jest.fn();
  const toYaml = jest.fn();
  const useYaml = jest.fn(() => ({
    toJSON,
    toYaml,
  }));
  return useYaml;
});

jest.mock("../layouts/WorkspaceLayout", () => {
  const mock = {
    setNewSource: () => null
  };
  return {
    useWorkspace: () => mock,
  };
});

jest.mock("../components/CodeEditor/lazy", () => {
  return () => null
})

jest.mock("@prisme.ai/validation", () => ({
  validateWorkspace: jest.fn()
}))

jest.mock("../layouts/Toaster", () => {
  const mock = {}
  return {
    useToaster() {
      return mock
    }
  }
})


it("should render empty", () => {
  const root = renderer.create(<WorkspaceSource />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render empty", async () => {
  (useWorkspace() as WorkspaceContext).workspace = {
    id: "42",
    automations: {},
    createdAt: "2022-01-01",
    updatedAt: "2022-01-01",
    name: "foo",
  };
  (useYaml().toYaml as jest.Mock).mockImplementation(() => "foo");
  const root = renderer.create(<WorkspaceSource />);
  await act(async () => {
    await true;
  });
  expect(root.toJSON()).toMatchSnapshot();
});

it('should check syntax', async () => {
  (useWorkspace() as any).workspace = {
    name: 'foo'
  };
  (useYaml().toYaml as jest.Mock).mockImplementation(() => `
  name: foo
`)
  const root = renderer.create(<WorkspaceSource />);
  await act(async () => {
    await true;
  })
  const ed = root.root.findByType(CodeEditor)
  expect(ed.props.annotations).toEqual([]);

  (useYaml().toJSON as jest.Mock).mockImplementation(() => {
    const e = new YAMLException('Invalid', {
      line: 3,
      position: 0,
      buffer: '',
      column: 0,
      snippet: 'error',
      name: 'error'
    })
    e.message = `Invalid in \"error\" (4:1)

error`
    throw e;
  })
  act(() => {
    ed.props.onChange(`
name: foo
automations
error
`)
  })
  await act(async () => {
    await true;
  })
  expect(root.root.findByType(CodeEditor).props.annotations).toEqual([{
    row: 3,
    column: 0,
    text: `Invalid in \"error\" (4:1)

error`,
    type: 'error'
  }]);

})

it('should check workspace format', async () => {
  (useWorkspace() as any).workspace = {
    name: 'foo'
  };
  (useWorkspace() as any).setInvalid = jest.fn();
  (useYaml().toYaml as jest.Mock).mockImplementation(() => `
  name: foo
`)
  const root = renderer.create(<WorkspaceSource />);
  await act(async () => {
    await true;
  })
  const ed = root.root.findByType(CodeEditor)
  expect(ed.props.annotations).toEqual([]);

  (useYaml().toJSON as jest.Mock).mockImplementation(() => ({
    name: 'foo',
    automations: []
  }));
  (validateWorkspace as any as jest.Mock).mockImplementation(() => {
    validateWorkspace.errors = [{
      instancePath: '/automations',
      keyword: '',
      message: 'automations should be an array',
      params: {},
      schemaPath: '/automations'
    }]
    return false;
  })

  act(() => {
    ed.props.onChange(`
name: foo
automations: []
`)
  })
  await act(async () => {
    await true;
  })
  expect((useWorkspace() as any).setInvalid).toHaveBeenCalledWith([{
    instancePath: '/automations',
    keyword: '',
    message: 'automations should be an array',
    params: {},
    schemaPath: '/automations'
  }])

})

it('should find endpoints', async () => {
  (useWorkspace() as any).workspace = {
    name: 'foo',
    id: '42'
  };
  (useYaml().toYaml as jest.Mock).mockImplementation(() => `name: foo
automations:
  foo:
    when:
      endpoint: true
`)
  useToaster().show = jest.fn();
  const listeners: any = {}
  const div = {
    addEventListener: (type: string, fn: Function) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(fn);
    },
    removeEventListener: () => null
  };
  (window.navigator.clipboard as any) = {
    writeText: jest.fn()
  }
  const root = renderer.create(<WorkspaceSource />, {
    createNodeMock: (element) => {
      if (element.type === 'div') return div
      return null;
    }
  });
  await act(async () => {
    await true;
  })
  const ed = root.root.findByType(CodeEditor)
  expect(ed.props.annotations).toEqual([{
    column: 0,
    row: 4,
    text: "http://localhost:3000/api/workspace/42/webhook/foo",
    type: "endpoint",
  },])

  listeners.click.forEach((fn: Function) => fn({
    target: {
      classList: {
        contains: () => true
      },
      textContent: '5'
    }
  }))

  expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/api/workspace/42/webhook/foo')
  expect(useToaster().show).toHaveBeenCalledWith({
    severity: "info",
    summary: "automations.endpoint.copied",
  })

})

it('should find custom endpoints', async () => {
  (useWorkspace() as any).workspace = {
    name: 'foo',
    id: '42'
  };
  (useYaml().toYaml as jest.Mock).mockImplementation(() => `name: foo
automations:
  foo:
    when:
      endpoint: custom
`)
  const root = renderer.create(<WorkspaceSource />);
  await act(async () => {
    await true;
  })
  const ed = root.root.findByType(CodeEditor)
  expect(ed.props.annotations).toEqual([{
    column: 0,
    row: 4,
    text: "http://localhost:3000/api/workspace/42/webhook/custom",
    type: "endpoint",
  },])
})

it('should create annotation for invalid lines on update', async () => {
  (useWorkspace() as any).workspace = {
    name: 'foo',
    id: '42'
  };
  (useYaml().toYaml as jest.Mock).mockImplementation(() => `name: foo
automations:
  foo:
    when:
      events:
        - bar
`)
  const root = renderer.create(<WorkspaceSource />);
  await act(async () => {
    await true;
  })

  const ed = root.root.findByType(CodeEditor);

  (useYaml().toJSON as jest.Mock).mockImplementation(() => {
    throw new YAMLException('invalid trigger', {
      buffer: '',
      line: 4,
      column: 4,
      position: 4,
      name: 'trigger',
      snippet: 'trigger'
    })
  });

  act(() => {
    ed.props.onChange(`name: foo
automations:
  foo:
    trigger:
      events:
        - bar
`)
  });

  await act(async () => {
    await true;
  })

  expect(ed.props.annotations).toEqual([
    {
      row: 4,
      column: 4,
      text: 'invalid trigger in "trigger" (5:5)\n\ntrigger',
      type: 'error'
    }
  ])
})

it('should create annotation for invalid server return', async () => {
  (useWorkspace() as any).workspace = {
    name: 'foo',
    id: '42',
    automations: {
      foo: {
        trigger: {
          events: ['bar']
        }
      }
    }
  };
  (useYaml().toYaml as jest.Mock).mockImplementation(() => `name: foo
automations:
  foo:
    trigger:
      events:
        - bar
`);
  (useWorkspace() as any).invalid = [{
    instancePath: '/automations/foo/trigger',
    keyword: 'trigger',
    message: 'trigger is invalid',
    params: '',
    schemaPath: '/automations/foo/trigger',
  }];

  const root = renderer.create(<WorkspaceSource />);
  await act(async () => {
    await true;
  })

  const ed = root.root.findByType(CodeEditor);

  expect(ed.props.annotations).toEqual([{
    row: 3,
    column: 0,
    text: 'trigger is invalid',
    type: 'error'
  }])
})
