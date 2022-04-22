import { Story } from '@storybook/react';
import { useState } from 'react';
import SchemaForm, { FormProps } from './SchemaForm';
import { useField } from 'react-final-form';
import { FieldProps } from './types';

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

const CustomUIWidget = ({ schema, name, label }: FieldProps) => {
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
