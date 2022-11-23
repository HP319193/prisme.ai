import { StretchContent } from '@prisme.ai/design-system';
import { useState } from 'react';
import { tw } from 'twind';
import { BlockComponent } from '../BlockLoader';
import { useBlock } from '../Provider';

interface PreviewInStory {
  Preview: BlockComponent['Preview'];
}

export const PreviewInStory = ({ Preview }: PreviewInStory) => {
  const [visible, setVisible] = useState(false);
  const { config } = useBlock();

  if (!Preview) return null;

  return (
    <div>
      <button
        onClick={() => setVisible(!visible)}
        className={tw`text-sm`}
        style={{
          borderRadius: '4px',
          borderTop: '1px solid #aaa',
          boxShadow: '0 -2px 2px #ccc',
          padding: '0 0.5rem',
          outline: 'none',
        }}
      >
        {visible ? 'Hide' : 'Show'} Preview in Console
      </button>
      <StretchContent visible={visible}>
        <Preview config={config} />
      </StretchContent>
    </div>
  );
};
