import WorkspaceSource from "./WorkspaceSource";
import renderer, { act } from "react-test-renderer";
import { useWorkspace, WorkspaceContext } from "../layouts/WorkspaceLayout";
import useYaml from "../utils/useYaml";
import CodeEditor from "../components/CodeEditor/lazy";
import { YAMLException } from "js-yaml";
import { validateWorkspace } from "@prisme.ai/validation";
import { findParameter } from "../utils/yaml";

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
  const mock = {};
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

jest.mock("../utils/yaml", () => {
  const findParameter = jest.fn(() => [])
  return {
    findParameter
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
    throw new YAMLException('Invalid', {
      line: 3,
      position: 0,
      buffer: '',
      column: 0,
      snippet: 'error',
      name: 'error'
    })
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
  (findParameter as jest.Mock).mockImplementation(() => [{
    line: 3,
    indent: 2,
    name: 'foo',
    value: true
  }]);
  (useYaml().toYaml as jest.Mock).mockImplementation(() => `name: foo
automations:
  foo:
    when:
      endpoint: true
`)
  const root = renderer.create(<WorkspaceSource />);
  await act(async () => {
    await true;
  })
  const ed = root.root.findByType(CodeEditor)
  expect(ed.props.annotations).toEqual([{
    column: 0,
    row: 2,
    text: "http://localhost:3000/api/workspace/42/webhook/true",
    type: "endpoint",
  },])
})
