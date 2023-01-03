import { CodeOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import Quill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CodeEditor from '../CodeEditor/lazy';
import pretty from 'pretty';

export interface RichTextEditorProps {
  value: string;
  onChange: (v: string) => void;
  htmlModeOnly?: boolean;
}
export const RichTextEditor = ({
  value,
  onChange,
  htmlModeOnly = false,
}: RichTextEditorProps) => {
  const { t } = useTranslation('workspaces');
  const [displayRaw, setDisplayRaw] = useState(false);
  const ref = useRef<ReactQuill>(null);
  const lastHeight = useRef(0);
  const toggle = useCallback(() => {
    if (htmlModeOnly && displayRaw) return;
    setDisplayRaw(!displayRaw);
    if (displayRaw) {
      onChange(value.replace(/\n/g, ''));
    } else {
      onChange(pretty(value));
    }
  }, [displayRaw, htmlModeOnly, onChange, value]);

  useEffect(() => {
    setDisplayRaw(htmlModeOnly);
  }, [htmlModeOnly]);

  if (ref.current) {
    // @ts-ignore
    lastHeight.current = ref.current.editor.container.getBoundingClientRect().height;
  }
  return (
    <div className="flex flex-1 flex-col">
      {!htmlModeOnly && (
        <div className="flex flex-1 justify-end">
          <Tooltip
            title={t('form.html', { context: displayRaw ? 'hide' : '' })}
            placement="left"
          >
            <button className="mr-8 mt-0" onClick={toggle}>
              <CodeOutlined />
            </button>
          </Tooltip>
        </div>
      )}
      {displayRaw ? (
        <div
          className="flex rounded-[.3rem] overflow-hidden"
          style={{ height: `${lastHeight.current}px` }}
        >
          <CodeEditor mode="html" value={value} onChange={onChange} />
        </div>
      ) : (
        <Quill ref={ref} theme="snow" value={value} onChange={onChange} />
      )}
    </div>
  );
};

export default RichTextEditor;
