import { insertItemInWorkspaceList } from './updateOnEvents';
import { Workspace } from './WorkspaceProvider';

it('should insert item', () => {
  const workspace = {
    pages: {},
    automations: {},
    imports: {},
  } as Workspace;
  expect(insertItemInWorkspaceList(workspace, 'pages', 'foo', {})).toEqual({
    pages: {
      foo: {},
    },
    automations: {},
    imports: {},
  });
});

it('should update item', () => {
  const workspace = ({
    pages: {
      foo: {},
    },
    automations: {},
    imports: {},
  } as unknown) as Workspace;
  expect(
    insertItemInWorkspaceList(workspace, 'pages', 'foo', {
      bar: 'bar',
    })
  ).toEqual({
    pages: {
      foo: {
        bar: 'bar',
      },
    },
    automations: {},
    imports: {},
  });
});

it('should update slug item', () => {
  const workspace = ({
    pages: {
      foo: {},
    },
    automations: {},
    imports: {},
  } as unknown) as Workspace;
  expect(
    insertItemInWorkspaceList(
      workspace,
      'pages',
      'bar',
      {
        bar: 'bar',
      },
      'foo'
    )
  ).toEqual({
    pages: {
      bar: {
        bar: 'bar',
      },
    },
    automations: {},
    imports: {},
  });
});
