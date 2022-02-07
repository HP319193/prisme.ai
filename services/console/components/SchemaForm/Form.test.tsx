import Form from './Form';
import renderer from 'react-test-renderer';
import { Form as FFForm } from 'react-final-form';

it('should render', () => {
  const schema = {
    required: ['foo'],
    properties: {
      foo: {
        type: 'string',
      },
      bar: {
        type: 'boolean',
      },
      lorem: {
        type: 'object',
      },
      ipsum: {
        type: 'array',
      },
    },
  };
  const onSubmit = jest.fn();
  const root = renderer.create(<Form schema={schema} onSubmit={onSubmit} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should submit', () => {
  const schema = {
    required: ['foo'],
    properties: {
      foo: {
        type: 'string',
      },
      bar: {
        type: 'boolean',
      },
      lorem: {
        type: 'object',
      },
      ipsum: {
        type: 'array',
      },
    },
  };
  const onSubmit = jest.fn();
  const root = renderer.create(<Form schema={schema} onSubmit={onSubmit} />);
  const errors = root.root.findByType(FFForm).props.onSubmit({});
  expect(errors).toEqual({ foo: 'required' });
});

it('should save string as string', () => {
  const schema = {
    required: ['foo'],
    properties: {
      foo: {
        type: 'object',
      },
    },
  };
  const onSubmit = jest.fn();
  const root = renderer.create(<Form schema={schema} onSubmit={onSubmit} />);
  root.root.findByType(FFForm).props.onSubmit({
    foo: 'value',
  });
  expect(onSubmit).toHaveBeenCalledWith({
    foo: 'value',
  });
});

it('should save object as object', () => {
  const schema = {
    required: ['foo'],
    properties: {
      foo: {
        type: 'object',
      },
    },
  };
  const onSubmit = jest.fn();
  const root = renderer.create(<Form schema={schema} onSubmit={onSubmit} />);
  root.root.findByType(FFForm).props.onSubmit({
    foo: '{"bar": 1}',
  });
  expect(onSubmit).toHaveBeenCalledWith({
    foo: {
      bar: 1,
    },
  });
});

it('should check oneOf rule', () => {
  const schema = {
    oneOf: [
      {
        required: ['foo', 'lorem'],
      },
      {
        required: ['bar', 'lorem'],
      },
    ],
    properties: {
      foo: {
        type: 'string',
      },
      bar: {
        type: 'string',
      },
      lorem: {
        type: 'string',
      },
    },
  };
  const onSubmit = jest.fn();
  const root = renderer.create(<Form schema={schema} onSubmit={onSubmit} />);
  const errors = root.root.findByType(FFForm).props.onSubmit({
    lorem: 'a',
  });
  expect(errors).toEqual({ foo: 'oneOfRequired', bar: 'oneOfRequired' });
});

it('should submit without error', () => {
  const schema = {
    required: ['foo'],
    properties: {
      foo: {
        type: 'string',
      },
    },
  };
  const onSubmit = jest.fn();
  const root = renderer.create(<Form schema={schema} onSubmit={onSubmit} />);
  const errors = root.root.findByType(FFForm).props.onSubmit({
    foo: 'a',
  });
  expect(onSubmit).toHaveBeenCalledWith({ foo: 'a' });
});
