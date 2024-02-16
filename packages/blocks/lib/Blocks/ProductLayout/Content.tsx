import { Block } from './Block';
import ContentPanel from './ContentPanel';
import { isBlock, isRenderProp } from './getContentType';
import { ContentProps, ProductLayoutProps } from './types';

function isContentProps(content: any): content is ContentProps {
  if (!content) return false;
  const { title, description, tabs } = content as ContentProps;
  return !!(title || description || tabs);
}

export const Content = ({
  content,
}: {
  content: ProductLayoutProps['content'];
}) => {
  if (isRenderProp(content)) return content;
  if (isBlock(content))
    return <Block content={content} className="product-layout-content" />;
  if (!isContentProps(content)) return null;
  return (
    <div className="product-layout-content">
      {content.title && (
        <Block
          content={content.title}
          className="product-layout-content-title"
          ifString={({ content, className }) => (
            <div className={className}>{content}</div>
          )}
        />
      )}
      {content.description && (
        <Block
          content={content.description}
          className="product-layout-content-description"
          ifString={({ content, className }) => (
            <div className={className}>{content}</div>
          )}
        />
      )}
      <ContentPanel {...content} />
    </div>
  );
};

export default Content;
