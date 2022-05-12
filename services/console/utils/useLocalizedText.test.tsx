import useLocalizedText from './useLocalizedText';
import renderer, { act } from 'react-test-renderer';

jest.mock('react-i18next', () => {
  const t = (str: string) => {
    switch (str) {
      case 'pages.blocks.form.onSubmit.label':
        return 'onSubmitLabel';
      case 'pages.blocks.form.onSubmit.description':
        return 'onSubmitDescription';
      case 'pages.blocks.form.onChange.label':
        return 'onChangeLabel';
      case 'pages.blocks.form.onChange.description':
        return 'onSubmitDescription';
      case 'pages.blocks.datatable.settings.title.label':
        return 'titleLabel';
      case 'pages.blocks.datatable.settings.title.description':
        return 'titleDescription';
      default:
        return str;
    }
  };
  const useTranslation = () => {
    return {
      t,
      i18n: {
        language: 'en',
      },
    };
  };

  const Trans = ({ children = null }) => {
    return children;
  };

  return {
    useTranslation,
    Trans,
  };
});

it('should localize string', () => {
  let localize = (schema: any): any => {};
  const Test = () => {
    localize = useLocalizedText().localize;
    return null;
  };

  const root = renderer.create(<Test />);
  act(() => {});

  const localizedStringObject = {
    cs: 'hello',
    es: 'hola',
  };

  const parsedStringObject = localize(localizedStringObject);

  expect(parsedStringObject).toBe('hello');
});

it('should localize schema form', () => {
  let localizeSchemaForm = (schema: any): any => {};
  const Test = () => {
    localizeSchemaForm = useLocalizedText().localizeSchemaForm;
    return null;
  };

  const root = renderer.create(<Test />);
  act(() => {});

  const localizedSchemaForm = {
    type: 'object',
    properties: {
      '': {
        type: 'string',
      },
    },
    title: {
      cs: 'hello',
      es: 'hola',
    },
  };

  const parsedSchemaForm = localizeSchemaForm(localizedSchemaForm);

  expect(parsedSchemaForm).toStrictEqual({
    type: 'object',
    properties: {
      '': {
        type: 'string',
      },
    },
    title: 'hello',
  });
});

it('should localize nested schema form', () => {
  let localizeSchemaForm = (schema: any): any => {};
  const Test = () => {
    localizeSchemaForm = useLocalizedText().localizeSchemaForm;
    return null;
  };

  const root = renderer.create(<Test />);
  act(() => {});
  const nestedTranslatedSchema = {
    type: 'object',
    properties: {
      test: {
        type: 'object',
        properties: {
          hello1: {
            type: 'string',
          },
          hello2: {
            type: 'localized:boolean',
          },
        },
        title: {
          af: 'coucou',
          jv: 'foo',
        },
      },
      hloho: {
        type: 'array',
        title: 'heho',
        items: {
          title: {
            ar: 'hey',
            eu: 'bar',
          },
          description: 'bla',
          type: 'localized:string',
        },
      },
    },
    title: {
      am: 'hey',
      ak: 'ho',
    },
  };

  const parsedNestedTranslatedSchema = localizeSchemaForm(
    nestedTranslatedSchema
  );

  expect(parsedNestedTranslatedSchema).toStrictEqual({
    type: 'object',
    properties: {
      test: {
        type: 'object',
        properties: {
          hello1: {
            type: 'string',
          },
          hello2: {
            type: 'localized:boolean',
          },
        },
        title: 'coucou',
      },
      hloho: {
        type: 'array',
        title: 'heho',
        items: {
          title: 'hey',
          description: 'bla',
          type: 'localized:string',
        },
      },
    },
    title: 'hey',
  });
});

it('should localize with i18n', () => {
  let localizeSchemaForm = (schema: any): any => {};
  const Test = () => {
    localizeSchemaForm = useLocalizedText().localizeSchemaForm;
    return null;
  };

  const root = renderer.create(<Test />);
  act(() => {});

  const schemaWithTranslations = {
    type: 'object',
    properties: {
      schema: {
        type: 'object',
      },
      onSubmit: {
        type: 'string',
        title: 'pages.blocks.form.onSubmit.label',
        description: 'pages.blocks.form.onSubmit.description',
      },
      onChange: {
        type: 'string',
        title: 'pages.blocks.form.onChange.label',
        description: 'pages.blocks.form.onChange.description',
      },
    },
  };

  const parsedTranslatedSchema = localizeSchemaForm(schemaWithTranslations);

  expect(parsedTranslatedSchema).toStrictEqual({
    type: 'object',
    properties: {
      schema: {
        type: 'object',
      },
      onSubmit: {
        type: 'string',
        title: 'onSubmitLabel',
        description: 'onSubmitDescription',
      },
      onChange: {
        type: 'string',
        title: 'onChangeLabel',
        description: 'onSubmitDescription',
      },
    },
  });
});

it('should localize with i18n', () => {
  let localizeSchemaForm = (schema: any): any => {};
  const Test = () => {
    localizeSchemaForm = useLocalizedText().localizeSchemaForm;
    return null;
  };

  const root = renderer.create(<Test />);
  act(() => {});

  const schemaWithTranslations = {
    type: 'object',
    properties: {
      title: {
        type: 'localized:string',
        title: 'pages.blocks.datatable.settings.title.label',
        description: 'pages.blocks.datatable.settings.title.description',
      },
    },
  };

  const parsedTranslatedSchema = localizeSchemaForm(schemaWithTranslations);

  expect(parsedTranslatedSchema).toStrictEqual({
    type: 'object',
    properties: {
      title: {
        type: 'localized:string',
        title: 'titleLabel',
        description: 'titleDescription',
      },
    },
  });
});
