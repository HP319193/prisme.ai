import { useState } from 'react';
import { useBlock } from '../../Provider';
import { useBlocks } from '../../Provider/blocksContext';
import { Block } from './Block';
import { ContentProps } from './types';

const Tab = ({
  title,
  type,
  value,
  payload,
  onClick,
  active,
}: ContentProps['tabs'][number] & { onClick: () => void; active: boolean }) => {
  const {
    components: { Link },
  } = useBlocks();
  const { events } = useBlock();
  const className = `product-layout-content-tab ${
    active ? 'product-layout-content-tab--active' : ''
  }`;

  if (!title) return null;
  if (['external', 'internal'].includes(type)) {
    return (
      <Link href={value} className={className}>
        <button onClick={onClick}>
          <Block
            content={title}
            ifString={({ className, content }) => (
              <span className={className}>{content}</span>
            )}
          />
        </button>
      </Link>
    );
  }

  return (
    <button
      className={className}
      onClick={() => {
        onClick();
        if (type === 'event' && value) {
          events?.emit(value, payload);
        }
      }}
    >
      <Block
        content={title}
        ifString={({ className, content }) => (
          <span className={className}>{content}</span>
        )}
      />
    </button>
  );
};

const EMPTY_ARRAY: ContentProps['tabs'] = [];

export const ContentPanel = ({ tabs = EMPTY_ARRAY, content }: ContentProps) => {
  const { isSelected, hasContent } = tabs.reduce(
    (prev, { content, selected }, index) => {
      if (selected && prev.isSelected === -1)
        return { ...prev, isSelected: index };
      if (content && prev.hasContent === -1)
        return { ...prev, hasContent: index };
      return prev;
    },
    { isSelected: -1, hasContent: -1 }
  );
  const [selectedIndex, setSelectedIndex] = useState(
    isSelected === -1 ? hasContent : isSelected
  );

  const panelContent = content || tabs[selectedIndex].content;

  return (
    <>
      <div className="product-layout-content-tabs">
        {tabs.map((item, index) => (
          <Tab
            {...item}
            onClick={() => setSelectedIndex(index)}
            active={index === selectedIndex}
          />
        ))}
      </div>
      <Block className="product-layout-content-panel" content={panelContent} />
    </>
  );
};
export default ContentPanel;
