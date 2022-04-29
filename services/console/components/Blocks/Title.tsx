import { SchemaForm, Schema, useBlock } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo } from 'react';

const LEVELS = Array.from(new Array(6), (v, k) => k);

const Setup = () => {
  const { t } = useTranslation('workspaces');
  const { config, setConfig } = useBlock();

  const schema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        title: {
          type: 'string',
          title: t('pages.blocks.title.settings.title'),
        },
        level: {
          type: 'string',
          title: t('pages.blocks.title.settings.level'),
          enum: LEVELS,
          enumNames: LEVELS.map((v) =>
            t('pages.blocks.title.settings.levelOption', {
              level: v + 1,
            })
          ),
        },
      },
      'ui:options': {
        grid: [[['title', 'level']]],
      },
    }),
    [t]
  );
  return (
    <SchemaForm schema={schema} onChange={setConfig} initialValues={config} />
  );
};

export const Title = () => {
  const { config = {}, setSetupComponent } = useBlock();

  useEffect(() => {
    if (!setSetupComponent) return;
    setSetupComponent(<Setup />);
  }, [setSetupComponent]);

  const Level = `h${config.level || 1}` as keyof JSX.IntrinsicElements;

  return <Level className="m-4">{config.title}</Level>;
};

export default Title;
