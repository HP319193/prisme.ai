import dynamic from 'next/dynamic';

export const CodeEditor = dynamic(() => import('./'), { ssr: false });
export const CodeEditorInline = dynamic(() => import('./Inline'), {
  ssr: false,
});

export default CodeEditor;
