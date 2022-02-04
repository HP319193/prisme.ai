import React from "react";
import { Layout, MenuTab, Button, SidePanelAutomations } from "../index";
import { Typography } from "antd";

export const Title = Typography.Title;

const AutomationsHeader = (
  <div className="flex justify-between items-center">
    <Title level={4} className="mb-0">
      Automations
    </Title>
    <Button>+ Add an automation</Button>
  </div>
);
const AutomationsContent = (
  <Layout
    className="border border-gray border-solid grow h-full rounded p-4 m-2"
    Header={AutomationsHeader}
  >
    {SidePanelAutomations}
  </Layout>
);

export interface SidePanelProps {}

const SidePanel = ({}: SidePanelProps) => (
  <Layout
    Header={<MenuTab items={["Apps", "Automations"]} onSelect={() => {}} />}
  >
    {AutomationsContent}
  </Layout>
);

export default SidePanel;
