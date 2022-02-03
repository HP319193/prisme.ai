import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import React from "react";
import { Space, Button } from "../";

const FeedLayoutHeader = () => (
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

export default FeedLayoutHeader;
