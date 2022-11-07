import AutomationBuilder from './AutomationBuilder';
import renderer, { act } from 'react-test-renderer';
import ReactFlow, { useZoomPanHelper } from 'react-flow-renderer';
import Panel from '../Panel';
import InstructionForm from './Panel/InstructionForm';
import ConditionForm from './Panel/ConditionForm';
import TriggerForm from './Panel/TriggerForm';
import { useWorkspace } from '../WorkspaceProvider';

jest.mock('react-flow-renderer', () => {
  const { useAutomationBuilder } = require('./context');
  const ReactFlow: any = () => {
    ReactFlow.context = useAutomationBuilder();
    return <div>ReactFlow</div>;
  };
  const ReactFlowProvider = ({ children }: any) => (
    <div className="ReactFlowProvider">{children}</div>
  );
  ReactFlow.ReactFlowProvider = ReactFlowProvider;
  const Controls = () => <div className="Controls" />;
  ReactFlow.Controls = Controls;
  const useZoomPanHelper = {
    fitView: jest.fn(),
  };
  ReactFlow.useZoomPanHelper = () => useZoomPanHelper;
  ReactFlow.ArrowHeadType = {
    Arrow: 'arrow',
  };
  ReactFlow.Background = function Background() {
    return null;
  };
  ReactFlow.BackgroundVariant = {
    Dots: 'dots',
  };

  return ReactFlow;
});

jest.mock('../WorkspaceProvider', () => {
  const mock = {};
  return {
    useWorkspace: () => mock,
  };
});

jest.mock('../Panel', () => {
  const Panel = ({ children }: any) => <div className="Panel">{children}</div>;
  return Panel;
});

beforeEach(() => {
  useWorkspace().workspace = {
    id: '42',
    name: 'foo',
    automations: {
      automationFoo: {
        name: 'Foo',
        do: [],
      },
      automationBar: {
        name: 'Foo',
        do: [],
      },
    },
    createdAt: '',
    updatedAt: '',
  };
});

it('should render', () => {
  const value = {
    name: 'Automation',
    do: [],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="a" value={value} onChange={onChange} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should fit zoom', () => {
  jest.useFakeTimers();
  const value = {
    name: 'Automation',
    do: [],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="a" value={value} onChange={onChange} />
  );

  act(() => {
    jest.runAllTimers();
  });

  expect(useZoomPanHelper().fitView).toHaveBeenCalled();
});

it('should build instructions schemas', () => {
  const value = {
    name: 'Automation',
    do: [],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="automationBar" value={value} onChange={onChange} />
  );
  expect((ReactFlow as any).context.instructionsSchemas.length).toBe(2);
  expect((ReactFlow as any).context.instructionsSchemas[0][0]).toBe(
    'automations.instruction.title_builtin'
  );
  expect((ReactFlow as any).context.instructionsSchemas[1][0]).toBe('foo');
  expect(
    Object.keys((ReactFlow as any).context.instructionsSchemas[1][1])
  ).toEqual(['automationFoo']);
});

it('should hide panel', async () => {
  jest.useFakeTimers();
  const value = {
    name: 'Automation',
    do: [],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="automationBar" value={value} onChange={onChange} />
  );

  await act(async () => {
    (ReactFlow as any).context.editInstruction([{ emit: {} }], 0);
    await true;
    jest.runAllTimers();
  });
  expect(root.root.findByType(Panel).props.visible).toBe(true);
  act(() => {
    root.root.findByType(Panel).props.onVisibleChange();
  });
  expect(root.root.findByType(Panel).props.visible).toBe(false);
});

it('should get schema', () => {
  const value = {
    name: 'Automation',
    do: [],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="automationBar" value={value} onChange={onChange} />
  );
  expect((ReactFlow as any).context.getSchema('emit').properties).toBeDefined();
});

it('should get app', () => {
  const value = {
    name: 'Automation',
    do: [],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="automationBar" value={value} onChange={onChange} />
  );
  expect((ReactFlow as any).context.getApp('automationFoo')).toEqual({
    name: 'foo',
    icon: '/file.svg',
    instructionName: 'Foo',
  });
});

it('should add instruction', async () => {
  jest.useFakeTimers();
  const value = {
    name: 'Automation',
    do: [],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="automationBar" value={value} onChange={onChange} />
  );
  act(() => {
    (ReactFlow as any).context.addInstruction(value.do, 0);
    jest.runAllTimers();
  });

  expect(root.root.findByType(InstructionForm)).toBeDefined();

  await act(async () => {
    await root.root
      .findByType(InstructionForm)
      .props.onSubmit({ foo: undefined });
  });

  expect(onChange).toHaveBeenCalledWith(expect.any(Function));
  expect(onChange.mock.calls[0][0](value)).toEqual({
    name: 'Automation',
    do: [
      {
        foo: undefined,
      },
    ],
  });
});

it('should remove instruction', async () => {
  const value = {
    name: 'Automation',
    do: [
      {
        foo: undefined,
      },
    ],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="automationBar" value={value} onChange={onChange} />
  );
  act(() => {
    (ReactFlow as any).context.removeInstruction(value.do, 0);
  });

  expect(onChange).toHaveBeenCalledWith(expect.any(Function));
  expect(onChange.mock.calls[0][0](value)).toEqual({
    name: 'Automation',
    do: [],
  });
});

it('should edit instruction', async () => {
  jest.useFakeTimers();
  const value = {
    name: 'Automation',
    do: [{ foo: undefined }],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="automationBar" value={value} onChange={onChange} />
  );
  act(() => {
    (ReactFlow as any).context.editInstruction(value.do, 0);
    jest.runAllTimers();
  });

  expect(root.root.findByType(InstructionForm)).toBeDefined();

  await act(async () => {
    await root.root.findByType(InstructionForm).props.onSubmit({ foo: true });
  });

  expect(onChange).toHaveBeenCalledWith(expect.any(Function));
  expect(onChange.mock.calls[0][0](value)).toEqual({
    name: 'Automation',
    do: [
      {
        foo: true,
      },
    ],
  });
});

it('should edit condition', async () => {
  const value = {
    name: 'Automation',
    do: [
      {
        conditions: {},
      },
    ],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="automationBar" value={value} onChange={onChange} />
  );
  act(() => {
    (ReactFlow as any).context.editCondition(value.do[0]);
  });

  expect(root.root.findByType(ConditionForm)).toBeDefined();

  await act(async () => {
    await root.root.findByType(ConditionForm).props.onChange('$a == 1');
  });

  expect(onChange).toHaveBeenCalledWith(expect.any(Function));
  expect(onChange.mock.calls[0][0](value)).toEqual({
    name: 'Automation',
    do: [
      {
        conditions: {
          '$a == 1': [],
          default: [],
        },
      },
    ],
  });
  jest.clearAllMocks();

  act(() => {
    (ReactFlow as any).context.editCondition(value.do[0]);
  });
  await act(async () => {
    await root.root.findByType(ConditionForm).props.onChange('$a == 2');
  });

  expect(onChange).toHaveBeenCalledWith(expect.any(Function));
  expect(onChange.mock.calls[0][0](value)).toEqual({
    name: 'Automation',
    do: [
      {
        conditions: {
          '$a == 1': [],
          '$a == 2': [],
          default: [],
        },
      },
    ],
  });
});

it('should edit trigger', async () => {
  const value = {
    name: 'Automation',
    do: [{ foo: undefined }],
  };
  const onChange = jest.fn();
  const root = renderer.create(
    <AutomationBuilder id="automationBar" value={value} onChange={onChange} />
  );
  act(() => {
    (ReactFlow as any).context.editTrigger();
  });

  expect(root.root.findByType(TriggerForm)).toBeDefined();

  await act(async () => {
    await root.root.findByType(TriggerForm).props.onChange({ events: ['foo'] });
  });

  expect(onChange).toHaveBeenCalledWith(expect.any(Function));
  expect(onChange.mock.calls[0][0](value)).toEqual({
    name: 'Automation',
    when: { events: ['foo'] },
    do: [
      {
        foo: undefined,
      },
    ],
  });
});
