import ContentPanel from './ContentPanel';
import { isBlock, isRenderProp } from '../utils/getContentType';
import { ContentProps, ProductLayoutProps } from './types';
import GenericBlock from '../utils/GenericBlock';

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
    return (
      <GenericBlock content={content} className="product-layout-content" />
    );
  if (!isContentProps(content)) return null;
  return (
    <div className="product-layout-content">
      {content.title && (
        <GenericBlock
          content={content.title}
          className="product-layout-content-title"
          ifString={({ content, className }) => (
            <div className={className}>{content}</div>
          )}
        />
      )}
      {content.description && (
        <GenericBlock
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
