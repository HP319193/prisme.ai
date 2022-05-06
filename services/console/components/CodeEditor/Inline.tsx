import * as React from 'react';

import CodeEditor, { CodeEditorProps } from './CodeEditor';

const DEFAULT_LINE_HEIGHT = 18;

export const CodeEditorInline: React.FC<CodeEditorProps> = ({
  value,
  ...props
}) => {
  const ref = React.useRef<any>(null);
  const [lineHeight, setLineHeight] = React.useState(0);

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current.editor.container.querySelector('.ace_gutter-cell');
    if (!el) return;
    const { height } = el.getBoundingClientRect();
    setLineHeight(height || DEFAULT_LINE_HEIGHT);
  }, [ref]);

  const singleLine = `${value}`.split(/\n/).length === 1;

  return (
    <React.Suspense fallback={<div />}>
      <CodeEditor
        {...props}
        style={{
          flex: 1,
          minHeight: '50px',
          border: '1px solid #E5E5E5',
          borderRadius: '10px',
          padding: '10px',
          ...(singleLine ? undefined : { background: 'white' }),
          ...props.style,
        }}
        value={
          typeof value === 'string' ? value : JSON.stringify(value, null, '  ')
        }
        maxLines={Infinity}
        ref={ref}
        showGutter={!singleLine}
        className={value ? 'filled' : ''}
      />
    </React.Suspense>
  );
};

export default CodeEditorInline;
