import dynamic from 'next/dynamic';
import { RichTextEditorProps } from './RichTextEditor';

const DynamicRichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
});
const RichTextEditor = (props: RichTextEditorProps) => (
  <DynamicRichTextEditor {...props} />
);
export default RichTextEditor;
