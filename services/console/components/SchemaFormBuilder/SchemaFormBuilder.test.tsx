import SchemaFormBuilder from './SchemaFormBuilder';
import renderer, { act } from 'react-test-renderer';
import { Button, Schema, Select } from '@prisme.ai/design-system';
import Properties from './Properties';

it('should render', () => {
  const schema: Schema = {
    type: 'object',
    properties: {
      string: {
        type: 'string',
      },
      number: {
        type: 'number',
      },
      boolean: {
        type: 'boolean',
      },
      lorem: {
        type: 'object',
        properties: {
          a: {
            type: 'string',
          },
          b: {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  };

  const onChange = jest.fn();
  const root = renderer.create(
    <SchemaFormBuilder value={schema} onChange={onChange} />
  );
  expect(root.toTree()).toMatchSnapshot();
});

it('should add properties in object', () => {
  const schema = {
    type: 'string',
  } as const;
  const onChange = jest.fn();
  const root = renderer.create(
    <SchemaFormBuilder value={schema} onChange={onChange} />
  );

  expect(root.root.findAllByType(Properties).length).toBe(0);

  act(() => {
    root.root.findAllByType(Select)[1].props.onChange('object');
  });

  expect(onChange).toHaveBeenCalledWith({
    type: 'object',
  });

  act(() => {
    root.update(
      <SchemaFormBuilder value={{ type: 'object' }} onChange={onChange} />
    );
  });

  expect(root.root.findAllByType(Properties).length).toBe(1);

  act(() => {
    root.root.findByType(Properties).findByType(Button).props.onClick();
  });
  expect(onChange).toHaveBeenCalledWith({
    type: 'object',
    properties: {
      '': {
        type: 'string',
      },
    },
  });
});

it('should set items in array', () => {
  const schema = {
    type: 'array',
  } as const;
  const onChange = jest.fn();
  const root = renderer.create(
    <SchemaFormBuilder value={schema} onChange={onChange} />
  );

  expect(root.root.findAllByType(SchemaFormBuilder).length).toBe(2);

  act(() => {
    root.root.findAllByType(SchemaFormBuilder)[1].props.onChange({
      type: 'string',
    });
  });

  expect(onChange).toHaveBeenCalledWith({
    type: 'array',
    items: {
      type: 'string',
    },
  });
});

it('should clean items when changing type', () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <SchemaFormBuilder
      value={{ type: 'array', items: { type: 'string' } }}
      onChange={onChange}
    />
  );
  act(() => {
    root.root.findAllByType(Select)[1].props.onChange('string');
  });
  expect(onChange).toHaveBeenCalledWith({
    type: 'string',
  });
});

it('should clean property when changing type', () => {
  const onChange = jest.fn();
  const root = renderer.create(
    <SchemaFormBuilder
      value={{ type: 'object', properties: { a: { type: 'string' } } }}
      onChange={onChange}
    />
  );
  act(() => {
    root.root.findAllByType(Select)[1].props.onChange('string');
  });
  expect(onChange).toHaveBeenCalledWith({
    type: 'string',
  });
});
