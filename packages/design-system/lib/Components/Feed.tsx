import { Space, Title } from '../index';
import { ReactElement } from 'react';

export type Section = {
  key?: string;
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
    className={`flex w-full bg-blue-200 flex-1 p-6 ${className || ''}`}
  >
    {sections.map(({ title, key = title, content }) => (
      <div key={key}>
        <Title level={5} className="mb-4 tracking-[0.15rem]">
          {title}
        </Title>
        {content}
      </div>
    ))}
  </Space>
);

export default Feed;
