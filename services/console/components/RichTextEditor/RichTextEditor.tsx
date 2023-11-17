import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import Quill from 'react-quill';
import { CodeEditorInline } from '../CodeEditor/lazy';
import pretty from 'pretty';
import { useImageUpload } from './useImageUpload';

const rawModeMarker = '<!-- raw mode -->';

export interface RichTextEditorProps {
  value: string;
  onChange: (v: string) => void;
}
export const RichTextEditor = ({
  value = '',
  onChange,
}: RichTextEditorProps) => {
  const [displayRaw, setDisplayRaw] = useState(
    typeof value === 'string' && value.includes(rawModeMarker)
  );
  const ignoreValueChange = useRef(false);
  const [quillMounted, setQuillMounted] = useState(true);
  const { t } = useTranslation('workspaces');
  const toolbarId = useRef(`toolbar-${(Math.random() * 1000).toFixed()}`);

  useImageUpload(value, onChange);

  useEffect(() => {
    if (ignoreValueChange.current) return;
    setQuillMounted(false);
    setTimeout(() => {
      setQuillMounted(true);
    });
  }, [value]);

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
            onClick={() => setDisplayRaw(!displayRaw)}
          >
            HTML
          </button>
        </Tooltip>
      </div>
      {displayRaw && (
        <div className="flex flex-1 rounded-[.3rem]">
          <CodeEditorInline
            mode="html"
            value={`${pretty(value.replace(rawModeMarker, ''))}`}
            onChange={(v) => onChange(`${v}${rawModeMarker}`)}
          />
        </div>
      )}
      {!displayRaw && quillMounted && (
        <>
          <div id={toolbarId.current}>
            <span className="ql-formats">
              <select className="ql-header"></select>
            </span>
            <span className="ql-formats">
              <button className="ql-bold"></button>
              <button className="ql-italic"></button>
              <button className="ql-underline"></button>
              <button className="ql-strike"></button>
            </span>
            <span className="ql-formats">
              <select className="ql-color"></select>
              <select className="ql-background"></select>
            </span>
            <span className="ql-formats">
              <button className="ql-script" value="sub"></button>
              <button className="ql-script" value="super"></button>
            </span>
            <span className="ql-formats">
              <button className="ql-blockquote"></button>
              <button className="ql-code-block"></button>
            </span>
            <span className="ql-formats">
              <button className="ql-list" value="ordered"></button>
              <button className="ql-list" value="bullet"></button>
              <button className="ql-indent" value="-1"></button>
              <button className="ql-indent" value="+1"></button>
            </span>
            <span className="ql-formats">
              <button className="ql-direction" value="rtl"></button>
              <select className="ql-align"></select>
            </span>
            <span className="ql-formats">
              <button className="ql-link"></button>
              <button className="ql-image"></button>
              <button className="ql-video"></button>
            </span>
            <span className="ql-formats">
              <button className="ql-clean"></button>
            </span>
          </div>
          <Quill
            defaultValue={value}
            onChange={(value) => {
              ignoreValueChange.current = true;
              setTimeout(() => {
                ignoreValueChange.current = false;
              }, 10);
              onChange(value);
            }}
            className="min-h-[10rem]"
            modules={{
              toolbar: {
                container: `#${toolbarId.current}`,
              },
            }}
          />
        </>
      )}
    </div>
  );
};

export default RichTextEditor;
