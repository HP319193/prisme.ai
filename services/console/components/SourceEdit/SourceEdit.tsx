import { YAMLException } from 'js-yaml';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useYaml from '../../utils/useYaml';
import CodeEditor from '../CodeEditor/lazy';

interface Annotation {
  row: number;
  column: number;
  text: string;
  type: 'error';
}

interface SourceEditProps {
  value: any;
  onChange: (value: SourceEditProps['value']) => void;
  onSave: () => void;
  visible?: boolean;
  mounted?: boolean;
  validate?: (value: any) => boolean;
}

export const SourceEdit = <T,>({
  value: original,
  onChange,
  onSave,
  visible = true,
  mounted = true,
  validate,
}: SourceEditProps) => {
  const { toJSON, toYaml } = useYaml();
  const { t } = useTranslation('workspaces');

  const [value, setValue] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [mountSourceComponent, setMountComponent] = useState(false);

  const initYaml = useCallback(async () => {
    try {
      const value = await toYaml(original);
      setValue(value);
    } catch (e) {}
  }, [original, toYaml]);

  const checkSyntaxAndReturnYAML = useCallback(
    async (value: string) => {
      if (!original || value === undefined) return;
      try {
        setAnnotations((prev) => (prev.length === 0 ? prev : []));
        return await toJSON<T>(value);
      } catch (e) {
        const { mark, message } = e as YAMLException;
        setAnnotations([
          {
            row: mark.line,
            column: mark.position,
            text: message,
            type: 'error',
          },
        ]);
      }
    },
    [original, toJSON]
  );

  const update = useCallback(
    async (newValue: string) => {
      try {
        const json = await checkSyntaxAndReturnYAML(newValue);

        if (!json) return;

        if (validate && !validate(json)) return;
        onChange(json);
      } catch (e) {}
    },
    [checkSyntaxAndReturnYAML, validate, onChange]
  );

  const shortcuts = useMemo(
    () => [
      {
        name: t('expert.save.help'),
        exec: onSave,
        bindKey: {
          mac: 'cmd-s',
          win: 'ctrl-s',
        },
      },
    ],
    [onSave, t]
  );

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    initYaml();
  }, [initYaml]);

  // Manage source panel display
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (visible) {
      setMountComponent(true);
    } else {
      t = setTimeout(() => setMountComponent(false), 200);
    }
    return () => {
      if (!t) return;
      clearTimeout(t);
      setMountComponent(false);
    };
  }, [visible]);

  if (value === undefined) return null;

  return (
    <div
      className={`
          absolute top-0 bottom-0 right-0 left-0
          bg-white
          flex flex-1
          transition-transform
          transition-duration-200
          transition-ease-in
          z-[11]
          ${visible && isLoaded ? '' : '-translate-y-full'}
        `}
    >
      <div className="flex flex-1 flex-col">
        {mounted && mountSourceComponent && (
          <CodeEditor
            mode="yaml"
            value={value}
            onChange={update}
            annotations={annotations}
            onLoad={onLoad}
            shortcuts={shortcuts}
          />
        )}
      </div>
    </div>
  );
};

export default SourceEdit;
