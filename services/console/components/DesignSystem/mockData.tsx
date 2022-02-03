import { Section } from "./Components/Feed";
import React from "react";
import { Button, Collapse, Space } from "./index";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";

export const itemsWithCollapseContent: Section[] = [
  {
    title: "TODAY",
    content: (
      <Collapse
        items={[
          {
            label: "New contact on Hubspot",
            content: "John doe is requesting a demo",
          },
          {
            label: "New email from Nathan",
            content: "Hello, I just wanted to spam your inbox",
          },
        ]}
      />
    ),
  },
  {
    title: "YESTERDAY",
    content: (
      <Collapse
        items={[
          {
            label: "New contact on Hubspot",
            content: "John doe is requesting a demo",
          },
          {
            label: "New email from Nathan",
            content: "Hello, I just wanted to spam your inbox",
          },
          {
            label: "New contact on Hubspot",
            content: "John doe is requesting a demo",
          },
          {
            label: "New email from Nathan",
            content: "Hello, I just wanted to spam your inbox",
          },
        ]}
      />
    ),
  },
];

export const FeedLayoutHeader = (
  <Space className="h-8">
    <Button>
      <Space>
        <FilterOutlined />
        Filter
      </Space>
    </Button>
    <Button type="grey">
      <Space>
        <SearchOutlined />
        Search
      </Space>
    </Button>
  </Space>
);
