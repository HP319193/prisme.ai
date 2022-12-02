import {
  Schema,
  SchemaForm,
  SchemaFormDescription,
} from '@prisme.ai/design-system';
import { useBlock } from '@prisme.ai/blocks';
import { useField } from 'react-final-form';
import { useTranslation } from 'next-i18next';
import { usePages } from '../../../PagesProvider';
import useSchema from '../../../SchemaForm/useSchema';
import { useEffect, useRef } from 'react';
import { useWorkspace } from '../../../../providers/Workspace';

const Debug = (props: any) => {
  const { t } = useTranslation('workspaces');
  const { config: { schema } = {} } = useBlock();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { pages } = usePages();
  const savedSchema = useRef(schema);
  const { extractSelectOptions } = useSchema({
    pages: pages.get(workspaceId),
  });

  useEffect(() => {
    if (schema) {
      savedSchema.current = schema;
    }
  }, [schema]);

  const field = useField(props.name);

  return (
    <SchemaFormDescription
      text={t('pages.blocks.development.settings.block.description')}
    >
      <label className="text-[10px] text-gray">
        {t('pages.blocks.development.settings.block.label')}
      </label>
      <SchemaForm
        schema={schema || savedSchema.current}
        buttons={[]}
        initialValues={field.input.value}
        onChange={field.input.onChange}
        utils={{ extractSelectOptions }}
      />
    </SchemaFormDescription>
  );
};

const schema: Schema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      title: 'pages.blocks.development.settings.url.label',
      description: 'pages.blocks.development.settings.url.description',
    },
    debug: {
      'ui:widget': Debug,
    },
  },
};

export default schema;
