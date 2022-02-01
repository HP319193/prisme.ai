import { Section } from "../components/DesignSystem/Feed";
import React from "react";
import { Collapse } from "../components/DesignSystem";

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
