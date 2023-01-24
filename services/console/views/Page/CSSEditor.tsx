import { useField } from 'react-final-form';
import { CodeEditor } from '../../components/CodeEditor/lazy';
import { Collapse, FieldProps, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { defaultStyles } from './defaultStyles';

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
export const CSSEditor = ({
  name,
  sectionIds = emptyArray,
}: FieldProps & { sectionIds?: SectionId[] }) => {
  const { t } = useTranslation('workspaces');
  const field = useField(name);
  const [reseting, setReseting] = useState(false);
  useEffect(() => {
    if (!reseting) return;
    field.input.onChange(defaultStyles);
    setReseting(false);
  }, [field.input, reseting]);

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
                <label className="font-bold">
                  {t('pages.details.styles.label')}
                </label>
                <Tooltip
                  title={t('pages.details.styles.description')}
                  placement="right"
                >
                  <button type="button" className="ml-2">
                    <InfoCircleOutlined />
                  </button>
                </Tooltip>
              </div>
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
    [completers, field.input.onChange, field.input.value, reseting, t]
  );
  return (
    <div className="my-2 p-0 border-[1px] border-gray-200 rounded">
      <Collapse items={items} />
    </div>
  );
};
export default CSSEditor;
