import { FC, useCallback, useMemo, useState } from 'react';
import { Story } from '@storybook/react';
import SchemaForm, { SchemaFormProps } from './SchemaForm';
import { useField } from 'react-final-form';
import { FieldProps, Schema } from './types';
import TextArea from '../TextArea';
import { action } from '@storybook/addon-actions';
import '../../../styles/schema-form.css';
import { FieldComponent } from './context';

export default {
  title: 'Components/SchemaForm',
  component: SchemaForm,
};

const Template: Story<SchemaFormProps> = (props) => {
  document.body.classList.remove('sb-main-padded');
  const [value, setValue] = useState<{ values: any }>(props.initialValues);
  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html: `html {
            font-size: 13px;
}
:root {
  --pr-form-object-border: 1px solid gray;
  --pr-form-accent-color: #015dff;
  --pr-form-error-color: #ff4d4f;
  --pr-form-margin-size: 1.6rem;
}
      `,
        }}
      ></style>
      <SchemaForm
        {...props}
        initialValues={value}
        onSubmit={setValue}
        onChange={setValue}
        locales={{
          freeAdditionalPropertiesLabel: 'Free additional properties',
        }}
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
    description: 'This is a <strong>description</strong>',
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
          add: 'Add an item',
          remove: 'Remove this',
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
      add: 'Add an object with a string',
      remove: 'Sorry, remove that',
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

export const WithNestedOneOf = Template.bind({});
WithNestedOneOf.args = {
  schema: {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
      },
    },
    oneOf: [
      {
        properties: {
          bar: {
            type: 'string',
          },
        },
      },
      {
        properties: {
          bar: {
            type: 'boolean',
          },
        },
        oneOf: [
          {
            properties: {
              babar: {
                type: 'string',
              },
            },
          },
          {
            properties: {
              fofoo: {
                type: 'string',
              },
            },
          },
        ],
      },
    ],
  },
};

export const WithSortedOneOf = Template.bind({});
WithSortedOneOf.args = {
  schema: {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
      },
      bar: {
        oneOf: [
          {
            title: 'As string',
            value: 'string',
            properties: {
              value: {
                type: 'string',
                title: 'String value',
              },
            },
          },
          {
            title: 'As number',
            value: 'number',
            properties: {
              value: {
                type: 'number',
                title: 'Number value',
              },
              currency: {
                type: 'string',
                title: 'Currency',
                enum: ['€', '$', '¥'],
              },
            },
          },
        ],
      },
    },
  } as Schema,
  initialValues: {
    bar: 'number',
    value: 42,
    currency: '$',
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
        'ui:options': {
          textarea: {
            rows: 3,
          },
        },
      },
      tags: {
        type: 'array',
        title: 'tags',
        description: 'Display a tags selector.',
        'ui:widget': 'tags',
        'ui:options': {
          allowNew: false,
          tags: {
            options: [
              {
                label: 'Foo',
                value: 'foo',
                color: '#ff00aa',
              },
              {
                label: 'Bar',
                value: 'bar',
                color: '#11bbaa',
              },
              {
                label: 'Daz',
                value: 'daz',
                color: '#558fff',
              },
            ],
          },
        },
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
        'ui:options': {
          date: {
            format: 'DD/MM/YY HH:mm',
          },
        },
      },
      color: {
        type: 'string',
        title: 'color',
        description: 'Display a color picker. Only available for string types.',
        'ui:widget': 'color',
      },
      radio: {
        type: 'string',
        title: 'radio',
        description: 'Display radio buttons instead of select',
        'ui:widget': 'radio',
        enum: [1, 2, 4],
        enumNames: ['One', 'Two', 'Three'],
      },
      slider: {
        type: 'number',
        title: 'Slider',
        description: 'Display a slider with static values',
        'ui:widget': 'slider',
        'ui:options': {
          slider: {
            steps: [
              {
                label: '7 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 7,
              },
              {
                label: '10 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 10,
              },
              {
                label: '12 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 12,
              },
              {
                label: '15 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 15,
              },
              {
                label: '20 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 20,
              },
              {
                label: '25 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 25,
              },
            ],
          },
        },
      },
      slider2: {
        type: 'number',
        title: 'Slider',
        description: 'Display a slider with static values',
        'ui:widget': 'slider',
        'ui:options': {
          slider: {
            steps: [
              {
                label: '7 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 0,
              },
              {
                label: '10 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 1,
              },
              {
                label: '12 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 2,
              },
              {
                label: '15 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 3,
              },
              {
                label: '20 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 4,
              },
              {
                label: '25 ans',
                description: '<div>Mensualités n€/mois<br/> bla bla</div>',
                value: 5,
              },
            ],
          },
        },
      },
      simulation: {
        type: 'number',
        title: '',
        default: 1,
        'ui:widget': 'slider',
        'ui:options': {
          slider: {
            steps: [
              {
                label: '7 ans',
                description:
                  '\n<div class="simulation-item__title">Mensualité</div>\n<div class="simulation-item__monthly">2 298 €/mois *</div>\n<div class="simulation-item__separator"></div>\n<div class="simulation-item__rate">Taux : 2,00% *</div>\n<div class="simulation-item__legal">Taux débiteur fixe* hors frais de dossier et hors assurance</div>\n',
                value: 0,
                className: 'simulation-tooltip',
              },
              {
                label: '10 ans',
                description:
                  '\n<div class="simulation-item__title">Mensualité</div>\n<div class="simulation-item__monthly">1 755 €/mois *</div>\n<div class="simulation-item__separator"></div>\n<div class="simulation-item__rate">Taux : 3,20% *</div>\n<div class="simulation-item__legal">Taux débiteur fixe* hors frais de dossier et hors assurance</div>\n',
                value: 1,
                className: 'simulation-tooltip',
              },
              {
                label: '15 ans',
                description:
                  '\n<div class="simulation-item__title">Mensualité</div>\n<div class="simulation-item__monthly">1 287 €/mois *</div>\n<div class="simulation-item__separator"></div>\n<div class="simulation-item__rate">Taux : 3,50% *</div>\n<div class="simulation-item__legal">Taux débiteur fixe* hors frais de dossier et hors assurance</div>\n',
                value: 2,
                className: 'simulation-tooltip',
              },
              {
                label: '20 ans',
                description:
                  '\n<div class="simulation-item__title">Mensualité</div>\n<div class="simulation-item__monthly">1 063 €/mois *</div>\n<div class="simulation-item__separator"></div>\n<div class="simulation-item__rate">Taux : 3,70% *</div>\n<div class="simulation-item__legal">Taux débiteur fixe* hors frais de dossier et hors assurance</div>\n',
                value: 3,
                className: 'simulation-tooltip',
              },
              {
                label: '25 ans',
                description:
                  '\n<div class="simulation-item__title">Mensualité</div>\n<div class="simulation-item__monthly">940 €/mois *</div>\n<div class="simulation-item__separator"></div>\n<div class="simulation-item__rate">Taux : 3,90% *</div>\n<div class="simulation-item__legal">Taux débiteur fixe* hors frais de dossier et hors assurance</div>\n',
                value: 4,
                className: 'simulation-tooltip',
              },
            ],
            showTooltip: 'always',
          },
        },
        validators: {
          required: {
            message: 'Veuillez choisir une option',
          },
        },
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
        description: 'Localized string description',
      },
      localizedTextarea: {
        type: 'localized:string',
        title: 'Localized string',
        description: 'Localized string description',
        'ui:widget': 'textarea',
      },
      localizedNumber: {
        type: 'localized:number',
        title: 'Localized number',
        description: 'Localized number description',
      },
      localizedBoolean: {
        type: 'localized:boolean',
        title: 'Localized boolean',
        description: 'Localized boolean description',
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

export const WithAutocompletee = (props: FormProps) => {
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
WithAutocompletee.args = {
  schema: {
    type: 'object',
    properties: {
      events: {
        type: 'string',
        'ui:widget': 'autocomplete',
        'ui:options': {
          autocomplete: {
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
    },
  },
};

export const WithDisabledFields = Template.bind({});
WithDisabledFields.args = {
  schema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        disabled: true,
      },
      boolean: {
        type: 'boolean',
        disabled: true,
      },
      number: {
        type: 'number',
        disabled: true,
      },
      array: {
        type: 'array',
        disabled: true,
      },
      object: {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
        },
        disabled: true,
      },
      insideArray: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            disabled: {
              type: 'string',
              disabled: true,
            },
            enabled: {
              type: 'string',
            },
          },
        },
      },
      insideObject: {
        type: 'object',
        properties: {
          disabled: {
            type: 'string',
            disabled: true,
          },
          enabled: {
            type: 'string',
          },
        },
      },
    },
  },
};

export const WithValidators = Template.bind({});
WithValidators.args = {
  schema: {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        pattern: '^[a-zA-Z]+$',
        errors: {
          pattern: 'Pattern is invalid',
        },
      },
    },
  },
};

export const WithCustomFileUpload = Template.bind({});
WithCustomFileUpload.args = {
  schema: {
    type: 'string',
    'ui:widget': 'upload',
  },
  utils: {
    uploadFile: async (file) => {
      action('uploading file')(file);
      return 'https://global-uploads.webflow.com/60a514cee679ef23b32cefc0/624702f7a07f6c0407632de8_Prisme.ai%20-%20Logo.svg';
    },
  },
};

const all: Schema['properties'] = {
  string: {
    type: 'string',
    title: 'string',
    description: 'string',
    placeholder: 'string',
    pattern: '^a',
    errors: {
      pattern: 'must start with letter a',
    },
  },
  number: {
    type: 'number',
    title: 'number',
    description: 'number',
    placeholder: 'number',
    pattern: '^1',
    errors: {
      pattern: 'must start with number 1',
    },
  },
  boolean: {
    type: 'boolean',
    title: 'boolean',
    description: 'boolean',
  },
  enum: {
    type: 'string',
    title: 'enum',
    description: 'enum',
    placeholder: 'enum',
    enum: ['1', '2', '3'],
    enumNames: ['One', 'Two', 'Three'],
  },
  textarea: {
    type: 'string',
    title: 'textarea',
    description: 'textarea',
    'ui:widget': 'textarea',
    placeholder: `on
many
lines`,
    pattern: '^a',
    errors: {
      pattern: 'must start with letter a',
    },
  },
  upload: {
    type: 'string',
    title: 'upload',
    description: 'upload',
    'ui:widget': 'upload',
  },
  date: {
    type: 'string',
    title: 'date',
    description: 'date',
    'ui:widget': 'date',
  },
  color: {
    type: 'string',
    title: 'color',
    description: 'color',
    'ui:widget': 'color',
  },
  radio: {
    type: 'string',
    title: 'radio',
    description: 'radio',
    'ui:widget': 'radio',
    enum: ['1', '2', '3'],
    enumNames: ['One', 'Two', 'Three'],
  },
  autocomplete: {
    type: 'string',
    title: 'autocomplete',
    description: 'autocomplete',
    pattern: '^.{2}',
    errors: {
      pattern: 'must have at least two character',
    },
    'ui:widget': 'autocomplete',
    'ui:options': {
      autocomplete: {
        options: [
          {
            label: 'One (1)',
            value: 'One',
          },
          {
            label: 'Two (2)',
            value: 'Two',
          },
          {
            label: 'Three (3)',
            value: 'Three',
          },
        ],
      },
    },
  },
  any: {
    title: 'any',
    description: 'any',
  },
};
export const WithStyles = Template.bind({});
WithStyles.args = {
  schema: {
    type: 'object',
    properties: {
      ...all,
      first: {
        type: 'object',
        properties: {
          ...all,
          chose: {
            title: 'String or date ?',
            oneOf: [
              {
                title: 'as string',
                value: 'string',
                properties: {
                  value: {
                    type: 'string',
                    title: 'String value',
                  },
                },
              },
              {
                title: 'as date',
                value: 'date',
                properties: {
                  value: {
                    type: 'string',
                    'ui:widget': 'date',
                    title: 'Pick date',
                  },
                },
              },
            ],
          },
        },
        title: 'first',
        description: 'first',
        additionalProperties: true,
      },
      second: {
        type: 'object',
        properties: all,
        title: 'second',
        description: 'second',
        additionalProperties: {
          type: 'string',
          title: 'more properties',
          description: 'more properties',
        },
        oneOf: [
          {
            title: 'This',
            properties: {
              this: {
                type: 'string',
              },
            },
          },
          {
            title: 'That',
            properties: {
              that: {
                type: 'object',
                additionalProperties: true,
              },
            },
          },
        ],
      },
      third: {
        type: 'object',
        properties: {
          four: {
            type: 'object',
            properties: {
              fifth: {
                type: 'string',
              },
            },
          },
        },
      },
      array: {
        type: 'array',
        title: 'string[]',
        description: 'string[]',
        items: {
          type: 'string',
          title: 'string',
          description: 'string',
        },
      },
      arrayOfObjects: {
        type: 'array',
        items: {
          type: 'object',
          properties: all,
        },
      },
    },
  },
};

const CustomField: FieldComponent = () => {
  return <div>CustomField</div>;
};
export const WithCustomUiWidget: Story<FormProps> = () => {
  document.body.classList.remove('sb-main-padded');
  const [value, setValue] = useState<{ values: any }>({});
  const schema: Schema = useMemo(
    () => ({
      type: 'array',
      items: {
        type: 'object',
        'ui:widget': 'customField',
      },
    }),
    []
  );
  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html: `html {
            font-size: 13px;
}
:root {
  --pr-form-object-border: 1px solid gray;
  --pr-form-accent-color: #015dff;
  --pr-form-error-color: #ff4d4f;
  --pr-form-margin-size: 1.6rem;
}
      `,
        }}
      ></style>
      <SchemaForm
        schema={schema}
        initialValues={value}
        onSubmit={setValue}
        onChange={setValue}
        locales={{
          freeAdditionalPropertiesLabel: 'Free additional properties',
        }}
        components={{
          UiWidgets: {
            customField: CustomField,
          },
        }}
      />
      <pre>
        <code>{value && JSON.stringify(value, null, '  ')}</code>
      </pre>
    </div>
  );
};

export const WithDefault = () => (
  <Template
    schema={{
      type: 'object',
      additionalProperties: {
        type: 'string',
        default: 'foo',
      },
    }}
  />
);

export const WithElmpty = () => (
  <Template
    schema={{
      type: 'object',
      properties: {
        // @ts-ignore
        foo: null,
        bar: {
          type: 'string',
        },
      },
    }}
  />
);
