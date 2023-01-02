import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
});
export default RichTextEditor;
