import { Title, Space } from '../index';
import { ReactElement } from 'react';

export type Section = {
  title: string;
  content: ReactElement;
};

export interface FeedProps {
  sections: Section[];
  ref?: HTMLDivElement;
  className?: string;
}

const Feed = ({ sections, className }: FeedProps) => (
  <Space
    direction="vertical"
    size="large"
    className={`flex w-full grow bg-blue-200 rounded p-6 ${className || ''}`}
  >
    {sections.map(({ title, content }) => (
      <div key={title}>
        <Title level={5} className="mb-4">
          {title}
        </Title>
        {content}
      </div>
    ))}
  </Space>
);

export default Feed;
