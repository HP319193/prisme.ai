import FeedLayoutHeader from "../Components/FeedHeader";
import React from "react";

import { Layout, Feed } from "../";
import { itemsWithCollapseContent } from "../mockData";

const WorkspaceFeed = () => {
  // Mock hook
  const feedSections = itemsWithCollapseContent;

  return (
    <Layout Header={FeedLayoutHeader}>
      {<Feed className="p-4 m-2" sections={feedSections} />}
    </Layout>
  );
};

export default WorkspaceFeed;
