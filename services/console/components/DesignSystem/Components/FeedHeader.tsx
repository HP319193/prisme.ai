import React, { ReactElement } from "react";
import { Space } from "../index";

interface FeedHeaderProps {
  buttons: ReactElement[];
}

const FeedHeader = ({ buttons }: FeedHeaderProps) => (
  <Space className="h-8">{buttons.map((button) => button)}</Space>
);

export default FeedHeader;
