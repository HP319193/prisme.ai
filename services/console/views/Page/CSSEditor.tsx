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

export const defaultStyles = `
body {
  --color-accent: #015dff;
  --color-accent-light: #80A4FF;
  --color-background: white;
  --color-text: black;
  --color-border: black;
  --color-background-transparent: rgba(0,0,0,0.05);
  --color-input-background: white;
  background-color: var(--color-background);
}

.content-stack__content {
  background-color: var(--color-background);
  margin-top: 1rem;
}

.content-stack__content .block-form {
  padding-left: 2rem !important;
}
.content-stack__content .block-cards,
.content-stack__content .block-rich-text {
  padding-left: 2rem;
}

.page-blocks {
  padding: 2rem;
}

.block-form {
  padding: 0;
}

.block-form label {
  color: var(--color-text)
}

.block-form .ant-input {
  width: calc(100% - 2rem);
  border-radius: 0.625rem;
  border-color: var(--color-border);
  color: var(--color-text);
  background-color: var(--color-input-background);
}

.block-form .ant-input::placeholder {
  color: black;
}`;

export const CSSEditor = ({
  name,
  sectionIds,
}: FieldProps & { sectionIds: { id: string; name: string }[] }) => {
  const { t } = useTranslation('workspaces');
  const field = useField(name, {
    defaultValue: defaultStyles,
  });
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
