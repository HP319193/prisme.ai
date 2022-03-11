import { Select } from '@prisme.ai/design-system';
import renderer from 'react-test-renderer';
import { Field } from './Field';

jest.mock('react-final-form', () => {
  const mock = {
    input: {},
    meta: {},
  };
  return {
    useField: () => mock,
  };
});

it('should display select with simple options', () => {
  const root = renderer.create(
    <Field
      field="foo"
      type="string"
      required={false}
      widget={{
        component: 'select',
        options: {
          options: ['foo', 'bar'],
        },
      }}
    />
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
  const root = renderer.create(
    <Field
      field="foo"
      type="string"
      required={false}
      widget={{
        component: 'select',
        options: {
          options: [
            { label: 'Foo', value: 'foo' },
            { label: 'Bar', value: 'bar' },
          ],
        },
      }}
    />
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
  const root = renderer.create(
    <Field
      field="foo"
      type="string"
      required={false}
      widget={{
        component: 'select',
        options: {
          options: true,
        },
      }}
    />
  );
  expect(root.root.findByType(Select).props.selectOptions).toEqual([]);
});
