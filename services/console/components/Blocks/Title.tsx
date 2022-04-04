import { useBlock } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import Form from '../SchemaForm/Form';
import { Schema } from '../SchemaForm/types';

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
          'ui:widget': 'select',
          'ui:options': {
            options: Array.from(new Array(6), (v, k) => k).map((k) => ({
              label: t('pages.blocks.title.settings.levelOption', {
                level: k + 1,
              }),
              value: k + 1,
            })),
          },
        },
      },
      'ui:options': {
        layout: 'columns',
        lines: [['title', 'level']],
      },
    }),
    [t]
  );
  return <Form schema={schema} onChange={setConfig} initialValues={config} />;
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
