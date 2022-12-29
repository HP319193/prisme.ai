import { useField } from 'react-final-form';
import { CodeEditor } from '../../components/CodeEditor/lazy';
import {
  Collapse,
  FieldProps,
  SchemaFormDescription,
  Tooltip,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { defaultStyles } from './defaultStyles';

export const CSSEditor = ({
  name,
  sectionIds,
}: FieldProps & { sectionIds: { id: string; name: string }[] }) => {
  const { t } = useTranslation('workspaces');
  const field = useField(name);
  const [reseting, setReseting] = useState(false);
  useEffect(() => {
    if (!reseting) return;
    field.input.onChange(defaultStyles);
    setReseting(false);
  }, [field.input, reseting]);
  const completers = useMemo(
    () => [
      {
        identifierRegexps: [/^#/],
        getCompletions(
          editor: any,
          session: any,
          pos: any,
          prefix: any,
          callback: Function
        ) {
          callback(
            null,
            sectionIds.map(({ id, name }) => ({
              name,
              value: `#${id}`,
              score: 1,
              meta: name,
            }))
          );
        },
      },
    ],
    [sectionIds]
  );
  const items = useMemo(
    () => [
      {
        label: (
          <SchemaFormDescription text={t('pages.details.styles.description')}>
            <div className="flex w-[95%] justify-between items-center">
              <label className="font-normal cursor-pointer">
                {t('pages.details.styles.label')}
              </label>
              <Tooltip title={t('pages.details.styles.reset.description')}>
                <button
                  type="button"
                  className="text-gray hover:text-orange-500 pr-2 flex items-center"
                  onClick={(event) => {
                    event.stopPropagation();
                    setReseting(true);
                  }}
                >
                  <DeleteOutlined />
                </button>
              </Tooltip>
            </div>
          </SchemaFormDescription>
        ),
        content: (
          <div className="relative flex h-80 mt-0 rounded-b overflow-hidden">
            {!reseting && (
              <CodeEditor
                mode="css"
                value={field.input.value}
                onChange={field.input.onChange}
                completers={completers}
              />
            )}
          </div>
        ),
      },
    ],
    [completers, field.input.onChange, field.input.value, reseting, t]
  );
  return (
    <div className="my-2 p-0 border-[1px] border-gray-200 rounded">
      <Collapse items={items} />
    </div>
  );
};
export default CSSEditor;
