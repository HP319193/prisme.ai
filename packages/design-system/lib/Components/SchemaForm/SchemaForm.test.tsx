import { Form } from 'react-final-form';
import renderer, { act } from 'react-test-renderer';
import SchemaForm from './SchemaForm';
import { Schema } from './types';

it('should render empty form', () => {
  const schema = {};
  const root = renderer.create(<SchemaForm schema={schema} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should submit form', () => {
  const schema = {};
  const onSubmit = jest.fn();
  const root = renderer.create(
    <SchemaForm schema={schema} onSubmit={onSubmit} />
  );
  const expected = {};
  act(() => {
    root.root.findByType(Form).props.onSubmit({ values: expected });
  });
  expect(onSubmit).toHaveBeenCalledWith(expected);
});

it('should change form', () => {
  const schema = {};
  const onChange = jest.fn();
  const root = renderer.create(
    <SchemaForm schema={schema} onChange={onChange} />
  );
  const expected = {};
  act(() => {
    root.root
      .findByProps((props: any) => !!props.onChange)
      .props.onChange(expected);
  });
  expect(onChange).toHaveBeenCalledWith(expected);
});

it('should render buttons', () => {
  const schema = {};
  const root = renderer.create(
    <SchemaForm
      schema={schema}
      buttons={[<button>foo</button>, <button>bar</button>]}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render no button', () => {
  const schema = {};
  const root = renderer.create(<SchemaForm schema={schema} buttons={[]} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render a single input', () => {
  const schema: Schema = {
    type: 'string',
  };
  const root = renderer.create(<SchemaForm schema={schema} buttons={[]} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render single all types', () => {
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
      array: {
        type: 'array',
        title: 'Localized',
        items: {
          type: 'object',
          properties: {
            string: {
              type: 'localized:string',
            },
            number: {
              type: 'localized:number',
            },
            boolean: {
              type: 'localized:boolean',
            },
          },
        },
      },
      object: {
        type: 'object',
        additionalProperties: true,
      },
      objectWithAdditionalProperties: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
      },
    },
  };
  const root = renderer.create(<SchemaForm schema={schema} buttons={[]} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should set locales', () => {
  const schema: Schema = {
    type: 'string',
  };
  const root = renderer.create(
    <SchemaForm
      schema={schema}
      locales={{
        submit: 'SUBMIT',
      }}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should set custom components', () => {
  const schema: Schema = {
    type: 'string',
  };
  const FieldText = jest.fn(() => <div>Custom FieldText</div>);
  const root = renderer.create(
    <SchemaForm
      schema={schema}
      components={{
        FieldText,
      }}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
  expect(FieldText).toHaveBeenCalledWith(
    expect.objectContaining({ schema, name: 'values' }),
    {}
  );
});

it('should use ui:widgets', () => {
  const schema: Schema = {
    type: 'object',
    properties: {
      array: {
        type: 'array',
        'ui:options': {
          array: 'row',
        },
      },
      upload: {
        type: 'string',
        'ui:widget': 'upload',
        'ui:options': {
          upload: { accept: 'image/jpeg' },
        },
      },
      textarea: {
        type: 'string',
        'ui:widget': 'textarea',
        'ui:options': {
          textarea: { rows: 6 },
        },
      },
      select: {
        type: 'string',
        'ui:widget': 'select',
        'ui:options': {
          select: {
            options: [
              { label: 'Foo', value: 'foo' },
              { label: 'Bar', value: 'bar' },
            ],
          },
        },
      },
      radio: {
        type: 'string',
        'ui:widget': 'radio',
        'ui:options': {
          select: {
            options: [
              { label: 'Foo', value: 'foo' },
              { label: 'Bar', value: 'bar' },
            ],
          },
        },
      },
      date: {
        type: 'string',
        'ui:widget': 'date',
        'ui:options': {
          date: {
            showToday: false,
          },
        },
      },
    },
  };
  const root = renderer.create(<SchemaForm schema={schema} />);
  expect(root.toJSON()).toMatchSnapshot();
});
