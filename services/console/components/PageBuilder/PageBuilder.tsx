import React, { useCallback } from 'react';
import BlocksListEditor from '../BlocksListEditor';

interface PageBuilderProps {
  value: Prismeai.Page['blocks'];
  onChange: (value: Prismeai.Page['blocks'], events?: string[]) => void;
}

export const PageBuilder = ({ value, onChange }: PageBuilderProps) => {
  const pageAsBlocksList = {
    slug: 'BlocksList',
    blocks: value,
  };

  const onPageBlocksChange = useCallback(
    ({ blocks }) => {
      onChange(blocks);
    },
    [onChange]
  );
  return (
    <div className="relative flex flex-1 overflow-x-hidden h-full">
      <BlocksListEditor
        value={pageAsBlocksList}
        onChange={onPageBlocksChange}
      />
    </div>
  );
};

export default PageBuilder;
