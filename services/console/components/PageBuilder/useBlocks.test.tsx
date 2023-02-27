import renderer from 'react-test-renderer';
import { workspaceContext, Workspace } from '../../providers/Workspace';
import workspaceContextValue from '../../providers/Workspace/workspaceContextValue.mock';
import useBlocks from './useBlocks';

jest.mock('./builtinBlocksVariants', () => [
  {
    name: 'Contact Form',
    slug: 'Form_Contact',
    block: 'Form',
    description: 'Un form de contact avec email et message',
    photo: '/images/blocks/preview.jpg',
    config: {
      schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
          },
          message: {
            type: 'string',
            'ui:widget': 'textarea',
          },
        },
      },
    },
  },
]);
const workspace: any = {
  id: '42',
  name: 'Foo',
  blocks: {
    'My custom form': {
      name: 'My custom form',
      block: 'Form',
      config: {
        type: 'string',
        title: 'just a single field',
      },
    },
    'My other custom form': {
      name: 'My other custom form',
      block: 'My custom form',
      config: {
        type: 'string',
        title: 'just a single field',
      },
    },
    'My crazy other custom form': {
      name: 'My crazy other custom form',
      block: 'My other custom form',
      config: {
        type: 'string',
        title: 'just a single field',
      },
    },
    'Unavailable block': {
      name: 'Because its from an uninstalled App',
      block: 'UninstalledApp.Block',
      config: {
        type: 'string',
        title: 'just a single field',
      },
    },
  },
  imports: {
    App: {
      slug: 'App',
      appName: 'App',
      blocks: [],
    },
    'App using App With Blocks': {
      slug: 'App using App With Blocks',
      appName: 'App using App With Blocks',
      blocks: [
        {
          slug: 'App using App With Blocks.another app block',
          name: 'Another App Block',
          block: 'App With Blocks.app block',
        },
      ],
    },
    'App With Blocks': {
      slug: 'App With Blocks',
      appName: 'App With Blocks',
      blocks: [
        {
          slug: 'App With Blocks.app block',
          name: 'App Block',
          url: 'http://app.block',
          description: 'some text',
        },
        {
          slug: 'App With Blocks.app block 2',
          name: 'App Block 2',
          description: 'some text',
          block: 'Form',
          config: {},
        },
      ],
    },
  },
};

jest.mock('../SchemaForm/BlockSelector', () => {
  return () => null;
});

it('should get available Blocks', () => {
  let expected: any;
  const C = () => {
    expected = useBlocks();
    return null;
  };
  renderer.create(
    <workspaceContext.Provider value={{ ...workspaceContextValue, workspace }}>
      <C />
    </workspaceContext.Provider>
  );

  expect(expected.available).toEqual([
    {
      builtIn: true,
      slug: 'Header',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Header.png',
    },
    {
      builtIn: true,
      slug: 'Hero',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Hero.png',
    },
    {
      builtIn: true,
      slug: 'Buttons',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Buttons.png',
    },
    {
      builtIn: true,
      slug: 'Form',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Form.png',
    },
    {
      builtIn: true,
      slug: 'Cards',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Cards.png',
    },
    {
      builtIn: true,
      slug: 'Breadcrumbs',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Breadcrumbs.png',
    },
    {
      builtIn: true,
      slug: 'TabsView',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-TabsView.png',
    },
    {
      builtIn: true,
      name: 'Contact Form',
      slug: 'Form_Contact',
      block: 'Form',
      description: 'Un form de contact avec email et message',
      photo: '/images/blocks/preview.jpg',
      config: {
        schema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
            },
            message: {
              type: 'string',
              'ui:widget': 'textarea',
            },
          },
        },
      },
    },
    {
      slug: 'My custom form',
      name: 'My custom form',
      from: 'Foo',
      block: 'Form',
      icon: '/file.svg',
      config: { type: 'string', title: 'just a single field' },
    },
    {
      slug: 'My other custom form',
      name: 'My other custom form',
      from: 'Foo',
      block: 'My custom form',
      icon: '/file.svg',
      config: { type: 'string', title: 'just a single field' },
    },
    {
      slug: 'My crazy other custom form',
      name: 'My crazy other custom form',
      from: 'Foo',
      block: 'My other custom form',
      icon: '/file.svg',
      config: { type: 'string', title: 'just a single field' },
    },
    {
      name: 'Another App Block',
      from: 'App using App With Blocks',
      slug: 'App using App With Blocks.another app block',
      block: 'App With Blocks.app block',
      icon: undefined,
    },
    {
      name: 'App Block',
      from: 'App With Blocks',
      description: 'some text',
      slug: 'App With Blocks.app block',
      url: 'http://app.block',
      icon: undefined,
    },
    {
      block: 'Form',
      config: {},
      name: 'App Block 2',
      from: 'App With Blocks',
      description: 'some text',
      slug: 'App With Blocks.app block 2',
      icon: undefined,
    },
  ]);

  expect(expected.variants).toEqual([
    {
      builtIn: true,
      slug: 'Header',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Header.png',
    },
    {
      builtIn: true,
      slug: 'Hero',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Hero.png',
    },
    {
      builtIn: true,
      slug: 'Buttons',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Buttons.png',
    },
    {
      builtIn: true,
      slug: 'Form',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Form.png',
      variants: [
        {
          builtIn: true,
          slug: 'Form_Contact',
          block: 'Form',
          name: 'Contact Form',
          description: 'Un form de contact avec email et message',
          photo: '/images/blocks/preview.jpg',
          config: {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                  'ui:widget': 'textarea',
                },
              },
            },
          },
        },
        {
          slug: 'My custom form',
          name: 'My custom form',
          from: 'Foo',
          block: 'Form',
          config: { type: 'string', title: 'just a single field' },
          icon: '/file.svg',
        },
        {
          slug: 'My other custom form',
          name: 'My other custom form',
          from: 'Foo',
          block: 'Form',
          config: { type: 'string', title: 'just a single field' },
          icon: '/file.svg',
        },
        {
          slug: 'My crazy other custom form',
          name: 'My crazy other custom form',
          from: 'Foo',
          block: 'Form',
          config: { type: 'string', title: 'just a single field' },
          icon: '/file.svg',
        },
        {
          block: 'Form',
          config: {},
          description: 'some text',
          name: 'App Block 2',
          from: 'App With Blocks',
          slug: 'App With Blocks.app block 2',
          icon: undefined,
        },
      ],
    },
    {
      builtIn: true,
      slug: 'Cards',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Cards.png',
    },
    {
      builtIn: true,
      slug: 'Breadcrumbs',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-Breadcrumbs.png',
    },
    {
      builtIn: true,
      slug: 'TabsView',
      name: 'pages.blocks.name',
      description: 'pages.blocks.description',
      photo: '/images/blocks/preview-TabsView.png',
    },
    {
      description: 'some text',
      name: 'App Block',
      from: 'App With Blocks',
      slug: 'App With Blocks.app block',
      url: 'http://app.block',
      icon: undefined,
      variants: [
        {
          block: 'App With Blocks.app block',
          from: 'App using App With Blocks',
          name: 'Another App Block',
          slug: 'App using App With Blocks.another app block',
          icon: undefined,
        },
      ],
    },
  ]);
});
