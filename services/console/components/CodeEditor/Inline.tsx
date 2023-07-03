import * as React from 'react';

import CodeEditor, { CodeEditorProps } from './CodeEditor';

export const CodeEditorInline: React.FC<CodeEditorProps> = ({
  value,
  className,
  ...props
}) => {
  const singleLine = `${value}`.split(/\n/).length === 1;

  return (
    <React.Suspense fallback={<div />}>
      <CodeEditor
        {...props}
        style={{
          flex: 1,
          minHeight: '50px',
          border: '1px solid #E5E5E5',
          borderRadius: '0.3rem',
          padding: '10px',
          ...(singleLine ? undefined : { background: 'white' }),
          ...props.style,
        }}
        value={
          typeof value === 'string' ? value : JSON.stringify(value, null, '  ')
        }
        maxLines={Infinity}
        showGutter={!singleLine}
        className={`${value ? 'filled' : ''} ${className}`}
      />
    </React.Suspense>
  );
};

export default CodeEditorInline;
