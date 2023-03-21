import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import Quill from 'react-quill';
import { CodeEditorInline } from '../CodeEditor/lazy';
import pretty from 'pretty';
import { isWysiwygSupported } from './isWysiwygSupported';

export interface RichTextEditorProps {
  value: string;
  onChange: (v: string) => void;
}
export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const { t } = useTranslation('workspaces');
  const [displayRaw, setDisplayRaw] = useState(true);

  const initialValue = useRef(value);
  useEffect(() => {
    setDisplayRaw(!isWysiwygSupported(`${initialValue.current}`));
  }, []);

  const toggle = useCallback(() => {
    setDisplayRaw(!displayRaw);
    if (displayRaw) {
      onChange(value.replace(/\n/g, ''));
    } else {
      onChange(pretty(value));
    }
  }, [displayRaw, onChange, value]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 justify-end">
        <Tooltip
          title={t('form.html', { context: displayRaw ? 'hide' : '' })}
          placement="left"
        >
          <button
            type="button"
            className={`pr-rich-text__html mt-0 ${
              displayRaw ? 'text-primary' : 'text-gray'
            } text-xs`}
            onClick={toggle}
          >
            HTML
          </button>
        </Tooltip>
      </div>
      {displayRaw ? (
        <div className="flex flex-1 rounded-[.3rem]">
          <CodeEditorInline
            mode="html"
            value={`${value}`}
            onChange={onChange}
          />
        </div>
      ) : (
        <Quill theme="snow" defaultValue={`${value}`} onChange={onChange} />
      )}
    </div>
  );
};

export default RichTextEditor;
