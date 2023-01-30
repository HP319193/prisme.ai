import { useField } from 'react-final-form';
import { CodeEditor } from '../../components/CodeEditor/lazy';
import { Collapse, FieldProps, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { defaultStyles as _defaultStyles } from './defaultStyles';

interface SectionId {
  id: string;
  name: string;
}

function compareSectionsIds(a: SectionId[], b: SectionId[]) {
  return Object.values(a).reduce((prev, { id, name }) => {
    const inB = b.find(({ id: bid }) => id === bid);
    if (!inB) return false;
    return prev && name === inB.name;
  }, true);
}

const emptyArray: SectionId[] = [];

interface CSSEditorProps extends FieldProps {
  sectionIds?: SectionId[];
  label?: string;
  description?: string;
  reset?: string;
  defaultStyles?: string;
}

export const CSSEditor = ({
  name,
  sectionIds = emptyArray,
  label = 'pages.details.styles.label',
  description = 'pages.details.styles.description',
  reset = 'pages.details.styles.reset.description',
  defaultStyles = _defaultStyles,
}: CSSEditorProps) => {
  const { t } = useTranslation('workspaces');
  const field = useField(name);
  const [reseting, setReseting] = useState(false);
  useEffect(() => {
    if (!reseting) return;
    field.input.onChange(defaultStyles);
    setReseting(false);
  }, [defaultStyles, field.input, reseting]);

  const [completers, setCompleters] = useState<any>();
  const prevSectionsIds = useRef<typeof sectionIds>([]);
  useEffect(() => {
    if (
      !compareSectionsIds(sectionIds, prevSectionsIds.current) ||
      !compareSectionsIds(prevSectionsIds.current, sectionIds)
    ) {
      setCompleters([
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
      ]);
    }
  }, [sectionIds]);

  const items = useMemo(
    () => [
      {
        label: (
          <div>
            <div className="flex w-[95%] justify-between items-center">
              <div>
                <label className="font-bold">{t(label)}</label>
                <Tooltip title={t(description)} placement="right">
                  <button type="button" className="ml-2">
                    <InfoCircleOutlined />
                  </button>
                </Tooltip>
              </div>
              <Tooltip title={t(reset)}>
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
          </div>
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
    [
      completers,
      description,
      field.input.onChange,
      field.input.value,
      label,
      reset,
      reseting,
      t,
    ]
  );
  return (
    <div className="my-2 p-0 border-[1px] border-gray-200 rounded">
      <Collapse items={items} />
    </div>
  );
};
export default CSSEditor;
