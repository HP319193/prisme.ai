import { PlusCircleOutlined } from '@ant-design/icons';
import { Input, Select, Switch } from '@prisme.ai/design-system';
import { useField } from 'react-final-form';
import renderer from 'react-test-renderer';
import { CodeEditorInline } from '../CodeEditor/lazy';
import { Field } from './Field';
import * as RFFA from 'react-final-form-arrays';

jest.mock('react-final-form-arrays', () => {
  const push = jest.fn();
  const remove = jest.fn();
  const mock = {
    fields: [] as any,
  };
  mock.fields.push = push;
  mock.fields.remove = remove;
  return {
    setFields: (fields: any) => {
      mock.fields = fields;
      mock.fields.push = push;
      mock.fields.remove = remove;
    },
    mock,
    FieldArray: ({ children }: any) => children(mock),
  };
});
jest.mock('react-final-form', () => {
  const mock = {
    input: {},
    meta: {},
  };
  return {
    useField: () => mock,
    Field: ({ children }: any) => children(mock),
  };
});

it('should display text input', () => {
  const onChange = jest.fn();
  useField('foo').input = {
    value: '',
    onChange,
  } as any;
  const root = renderer.create(<Field field="foo" type="string" />);
  expect(root.root.findByType(Input).props.value).toEqual('');
  root.root.findByType(Input).props.onChange({ target: { value: 'bar' } });
  expect(onChange).toHaveBeenCalledWith({ target: { value: 'bar' } });
});

it('should display number input', () => {
  const onChange = jest.fn();
  useField('foo').input = {
    value: 0,
    onChange,
  } as any;
  const root = renderer.create(<Field field="foo" type="number" />);
  expect(root.root.findByType(Input).props.value).toEqual(0);
  expect(root.root.findByType(Input).props.inputType).toEqual('number');
  root.root.findByType(Input).props.onChange({ target: { value: 42 } });
  expect(onChange).toHaveBeenCalledWith({ target: { value: 42 } });
});

it('should display boolean input', () => {
  const onChange = jest.fn();
  useField('foo').input = {
    value: false,
    onChange,
  } as any;
  const root = renderer.create(<Field field="foo" type="boolean" />);
  expect(root.root.findByType(Switch).props.checked).toEqual(false);
  root.root.findByType(Switch).props.onChange(true);
  expect(onChange).toHaveBeenCalledWith(true);
});

it('should display simple object input', () => {
  const root = renderer.create(
    <Field
      field="foo"
      type="object"
      properties={{
        a: {
          type: 'string',
        },
        b: {
          type: 'boolean',
        },
        c: {
          type: 'number',
        },
      }}
    />
  );
  expect(root.root.findAllByType(Input).length).toBe(2);
  expect(root.root.findAllByType(Switch).length).toBe(1);
});

it('should display nested object input', () => {
  const root = renderer.create(
    <Field
      field="foo"
      type="object"
      properties={{
        a: {
          type: 'object',
          properties: {
            b: {
              type: 'object',
              properties: {
                c: {
                  type: 'string',
                },
              },
            },
          },
        },
      }}
    />
  );
  expect(root.root.findAllByType(Input).length).toBe(1);
  expect(root.root.findAllByType('label').length).toBe(3);
});

it('should display object input with additional properties', () => {
  const root = renderer.create(
    <Field
      field="foo"
      type="object"
      properties={{
        a: {
          type: 'object',
          additionalProperties: true,
        },
      }}
    />
  );
  expect(root.root.findAllByType(CodeEditorInline).length).toBe(1);
});

it('should display array input empty', () => {
  const root = renderer.create(
    <Field
      field="foo"
      type="array"
      items={{
        type: 'string',
      }}
    />
  );
  expect(root.root.findAllByType(PlusCircleOutlined).length).toBe(1);
  expect(root.root.findAllByType(Input).length).toBe(0);
  expect(root.root.findAllByType('button').length).toBe(1);
  root.root.findByType('button').props.onClick();
  expect((RFFA as any).mock.fields.push).toBeCalledWith('');
});

it('should display array input', () => {
  (RFFA as any).setFields([true, false]);
  const root = renderer.create(
    <Field
      field="foo"
      type="array"
      items={{
        type: 'boolean',
      }}
    />
  );

  expect(root.root.findAllByType(Switch).length).toBe(2);
});

it('should display nested array input', () => {
  (RFFA as any).setFields([['foo']]);
  const root = renderer.create(
    <Field
      field="foo"
      type="array"
      items={{
        type: 'array',
        items: {
          type: 'string',
        },
      }}
    />
  );

  expect(root.root.findAllByType(PlusCircleOutlined).length).toBe(2);
});

it('should display select with simple options', () => {
  const props = {
    'ui:widget': 'select',
    'ui:options': {
      options: ['foo', 'bar'],
    },
  };
  const root = renderer.create(
    <Field field="foo" type="string" required={[]} {...props} />
  );
  expect(root.root.findByType(Select).props.selectOptions).toEqual([
    {
      label: 'foo',
      value: 'foo',
    },
    {
      label: 'bar',
      value: 'bar',
    },
  ]);
});

it('should display select with options', () => {
  const props = {
    'ui:widget': 'select',
    'ui:options': {
      options: [
        { label: 'Foo', value: 'foo' },
        { label: 'Bar', value: 'bar' },
      ],
    },
  };
  const root = renderer.create(
    <Field field="foo" type="string" required={[]} {...props} />
  );
  expect(root.root.findByType(Select).props.selectOptions).toEqual([
    {
      label: 'Foo',
      value: 'foo',
    },
    {
      label: 'Bar',
      value: 'bar',
    },
  ]);
});

it('should display select with invalid options', () => {
  const props = {
    'ui:widget': 'select',
    'ui:options': {
      options: true,
    },
  };
  const root = renderer.create(
    <Field field="foo" type="string" required={[]} {...props} />
  );
  expect(root.root.findByType(Select).props.selectOptions).toEqual([]);
});
