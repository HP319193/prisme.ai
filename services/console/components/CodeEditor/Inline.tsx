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
          minHeight: `${2 * lineHeight}px`,
          flex: 1,
          border: '1px solid #ced4da',
          borderRadius: '6px',
          ...(singleLine ? undefined : { background: 'white' }),
        }}
        value={
          typeof value === 'object' ? JSON.stringify(value, null, '  ') : value
        }
        maxLines={Infinity}
        ref={ref}
        showGutter={!lineHeight || !singleLine}
        className={value ? 'filled' : ''}
      />
    </React.Suspense>
  );
};

export default CodeEditorInline;
