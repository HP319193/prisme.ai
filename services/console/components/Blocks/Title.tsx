import { useBlock } from '@prisme.ai/design-system';

const LEVELS = Array.from(new Array(6), (v, k) => k);

const schema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: 'pages.blocks.title.settings.title',
    },
    level: {
      type: 'string',
      title: 'pages.blocks.title.settings.level',
      enum: LEVELS,
      enumNames: LEVELS.map(
        (v) => `pages.blocks.title.settings.levelOption_${v + 1}`
      ),
    },
  },
  'ui:options': {
    grid: [[['title', 'level']]],
  },
};

export const Title = () => {
  const { config = {} } = useBlock();

  const Level = `h${config.level || 1}` as keyof JSX.IntrinsicElements;

  return <Level className="m-4">{config.title}</Level>;
};

Title.schema = schema;

export default Title;
