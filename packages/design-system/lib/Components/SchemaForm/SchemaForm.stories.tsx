import { FC, useCallback, useMemo } from 'react';
import { Story } from '@storybook/react';
import { useState } from 'react';
import SchemaForm, { FormProps } from './SchemaForm';
import { useField } from 'react-final-form';
import { FieldProps, Schema } from './types';
import TextArea from '../TextArea';

export default {
  title: 'Components/SchemaForm',
  component: SchemaForm,
};

const Template: Story<FormProps> = (props) => {
  const [value, setValue] = useState<{ values: any }>(props.initialValues);
  return (
    <div>
      <SchemaForm
        {...props}
        initialValues={value}
        onSubmit={setValue}
        onChange={setValue}
      />
      <pre>
        <code>{value && JSON.stringify(value, null, '  ')}</code>
      </pre>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  schema: {
    type: 'object',
    title: 'Title',
    description: 'This is a description',
    properties: {
      string: {
        type: 'string',
        title: 'some string',
        description: 'type some caracters',
      },
      number: {
        type: 'number',
      },
      boolean: {
        type: 'boolean',
        description: 'A switch',
      },
      object: {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
          bar: {
            type: 'number',
          },
        },
      },
      array: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      objectsArray: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            fooArray: {
              type: 'string',
            },
            barArray: {
              type: 'number',
            },
          },
          additionalProperties: true,
        },
      },
      enum: {
        type: 'string',
        title: 'with enum',
        description: 'list of choices',
        enum: [1, 2, 3],
        enumNames: ['One', 'Two', 'Three'],
      },
      free: {
        title: 'Set whatever you want',
      },
    },
    additionalProperties: {
      type: 'string',
    },
  },
};

export const TextOnly = Template.bind({});
TextOnly.args = {
  schema: {
    type: 'string',
    title: 'Juste a single string value',
  },
};

export const WithHidden = Template.bind({});
WithHidden.args = {
  initialValues: {
    bar: 42,
  },
  schema: {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        hidden: true,
      },
      bar: {
        type: 'string',
      },
    },
  },
};

export const WithOneOf = Template.bind({});
WithOneOf.args = {
  initialValues: {
    foo: true,
  },
  schema: {
    type: 'object',
    oneOf: [
      {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      {
        properties: {
          foo: {
            type: 'boolean',
          },
        },
      },
    ],
  },
};

export const WithOneOfWithValues = Template.bind({});
WithOneOfWithValues.args = {
  initialValues: {
    type: 'boolean',
    foo: true,
  },
  schema: {
    type: 'object',
    title: 'Type',
    description:
      'Choose a type, it will set the type value and display a specific form',
    properties: {
      value: {
        type: 'string',
      },
    },
    oneOf: [
      {
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      {
        properties: {
          foo: {
            type: 'boolean',
          },
        },
      },
    ],
    'ui:options': {
      oneOf: {
        options: [
          {
            label: 'String',
            index: 0,
            value: {
              type: 'string',
            },
          },
          {
            label: 'Boolean',
            index: 1,
            value: {
              type: 'boolean',
            },
          },
        ],
      },
    },
  },
};

export const WithOneOfWithArray = Template.bind({});
WithOneOfWithArray.args = {
  schema: {
    type: 'array',
    items: {
      type: 'object',
      oneOf: [
        {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        {
          properties: {
            bar: {
              type: 'string',
            },
          },
        },
      ],
    },
  },
};

export const WithOneOfWithMergedProperties = Template.bind({});
WithOneOfWithMergedProperties.args = {
  schema: {
    type: 'object',
    properties: {
      label: {
        type: 'string',
      },
    },
    oneOf: [
      {
        properties: {
          url: {
            type: 'string',
          },
        },
      },
      {
        properties: {
          event: {
            type: 'string',
          },
        },
      },
    ],
  },
};

export const GridLayout = Template.bind({});
GridLayout.args = {
  schema: {
    type: 'object',
    title: 'With Grid layout',
    properties: {
      foo: {
        type: 'string',
      },
      bar: {
        type: 'string',
      },
      lorem: {
        type: 'string',
        'ui:widget': 'textarea',
      },
      ipsum: {
        type: 'string',
      },
    },
    'ui:options': {
      grid: [[['foo', 'lorem'], ['ipsum']]],
    },
  },
};

const CustomUIWidget = ({ schema, name }: FieldProps) => {
  const field = useField(name);

  return (
    <div>
      <div>{schema.title}</div>
      <div>{schema.description}</div>
      <div>
        <button onClick={() => field.input.onChange('foo')}>
          Click here to set value to "foo"
        </button>
      </div>
      <div>
        <button onClick={() => field.input.onChange('bar')}>
          Click here to set value to "bar"
        </button>
      </div>
    </div>
  );
};
export const UIWidgets = Template.bind({});
UIWidgets.args = {
  schema: {
    type: 'object',
    title: 'All available ui:widgets',
    properties: {
      upload: {
        type: 'string',
        title: 'upload',
        description:
          'Get a file and store it as data url. Only available for string types.',
        'ui:widget': 'upload',
      },
      textarea: {
        type: 'string',
        title: 'textarea',
        description: 'Display a textarea. Only available for string types.',
        'ui:widget': 'textarea',
      },
      select: {
        type: 'string',
        title: 'select',
        description: 'Display a Select.',
        'ui:widget': 'select',
        'ui:options': {
          select: {
            options: [
              {
                label: 'Foo',
                value: 'foo',
              },
              {
                label: 'Bar',
                value: 'bar',
              },
            ],
          },
        },
      },
      date: {
        type: 'string',
        title: 'date',
        description: 'Display a date picker. Only available for string types.',
        'ui:widget': 'date',
      },
      color: {
        type: 'string',
        title: 'color',
        description: 'Display a color picker. Only available for string types.',
        'ui:widget': 'color',
      },
      custom: {
        type: 'string',
        title: 'React Component',
        description:
          'You can display a custom react component by passing it to ui:widget. The type is not important but need to be set.',
        'ui:widget': CustomUIWidget,
        'ui:options': {
          textarea: {
            autoSize: true,
          },
        },
      },
    },
  },
};

export const Localized = Template.bind({});
Localized.args = {
  schema: {
    type: 'object',
    title: 'With Localized Strings',
    properties: {
      localizedString: {
        type: 'localized:string',
        title: 'Localized string',
      },
      localizedTextarea: {
        type: 'localized:string',
        title: 'Localized string',
        'ui:widget': 'textarea',
      },
      localizedNumber: {
        type: 'localized:number',
        title: 'Localized number',
      },
      localizedBoolean: {
        type: 'localized:boolean',
        title: 'Localized boolean',
      },
    },
  },
};

export const WithCustomFieldContainer = Template.bind({});
const FieldContainer: FC<FieldProps> = ({ name, children }) => {
  const field = useField(name);
  const [value, setValue] = useState('');
  const [displayRaw, setDisplayRaw] = useState(false);
  const toggle = useCallback(() => {
    setDisplayRaw(!displayRaw);
    if (!displayRaw) {
      setValue(
        typeof field.input.value === 'string'
          ? field.input.value
          : JSON.stringify(field.input.value, null, '  ')
      );
    }
  }, [displayRaw, field.input.value]);
  const onChange = useCallback(
    (value: string) => {
      setValue(value);
      try {
        field.input.onChange(JSON.parse(value));
      } catch {
        field.input.onChange(value);
      }
    },
    [field.input]
  );
  return (
    <div className="flex flex-1 flex-col">
      <button onClick={toggle}>toggle raw</button>
      {displayRaw && (
        <div>
          <TextArea
            value={value}
            onChange={({ target: { value } }) => onChange(value)}
            label="Now, you can set any value as you want"
          />
        </div>
      )}
      {!displayRaw && children}
    </div>
  );
};
WithCustomFieldContainer.args = {
  schema: {
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
        items: {
          type: 'string',
        },
      },
      object: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },
  components: {
    FieldContainer,
  },
};

export const ObjectWithMixedPropertiesAndFreeAdditionnals = Template.bind({});
ObjectWithMixedPropertiesAndFreeAdditionnals.args = {
  schema: {
    type: 'object',
    properties: {
      body: {
        type: 'object',
        additionalProperties: true,
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
    },
    description: '',
    title: '',
  },
  initialValues: {
    body: {
      foo: 'bar',
      other: 'coin',
    },
  },
};

export const WithCustomSelect = (props: FormProps) => {
  const [value, setValue] = useState<{ values: any }>(props.initialValues);
  const extractSelectOptions = useCallback((schema: Schema) => {
    return [
      {
        label: 'This',
        value: 'this',
      },
      {
        label: 'Is',
        value: 'is',
      },
      {
        label: 'Generated',
        value: 'generated',
      },
      {
        label: 'From',
        value: 'from',
      },
      {
        label: 'External',
        value: 'external',
      },
      {
        label: 'Function',
        value: 'function',
      },
    ];
  }, []);
  return (
    <div>
      <SchemaForm
        {...props}
        initialValues={value}
        onSubmit={setValue}
        onChange={setValue}
        utils={{
          extractSelectOptions,
        }}
      />
      <pre>
        <code>{value && JSON.stringify(value, null, '  ')}</code>
      </pre>
    </div>
  );
};
WithCustomSelect.args = {
  schema: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        'ui:widget': 'select',
        'ui:options': {
          test: Math.random(),
        },
      },
    },
  },
};

export const WithDefaultValues = (props: FormProps) => {
  const [value, setValue] = useState<{ values: any }>(props.initialValues);

  return (
    <div>
      <SchemaForm
        {...props}
        initialValues={value}
        onSubmit={setValue}
        onChange={setValue}
      />
      <pre>
        <code>{value && JSON.stringify(value, null, '  ')}</code>
      </pre>
    </div>
  );
};
WithDefaultValues.args = {
  schema: {
    type: 'object',
    properties: {
      string: {
        type: 'string',
        default: 'foo',
      },
      number: {
        type: 'number',
        default: 42,
      },
      boolean: {
        type: 'boolean',
        default: true,
      },
      array: {
        type: 'array',
        items: {
          type: 'string',
        },
        default: ['foo', 'bar'],
      },
      object: {
        type: 'object',
        additionalProperties: true,
        default: { foo: 'bar' },
      },
    },
  },
};
