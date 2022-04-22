import { Button, Layout, MenuTab, PageHeader } from '../index';
import { LayoutProps } from './Layout';
import { Story } from '@storybook/react';

export default {
  title: 'Components/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  },
};

const HeaderComponent = <div>Header component</div>;

const PageHeaderButtons = [
  <Button variant="grey" key="1">
    Button 1
  </Button>,
  <Button key="2">Button 2</Button>,
];
const CurrentPageHeader = (
  <PageHeader
    onBack={() => {}}
    title={'Send mail automation'}
    RightButtons={PageHeaderButtons}
  />
);

const BodyComponent = (
  <div className="h-full bg-slate-200 flex items-center justify-center grow">
    page content
  </div>
);

const Template: Story<LayoutProps> = ({ Header, PageHeader, children }) => (
  <Layout Header={Header} PageHeader={PageHeader}>
    {children}
  </Layout>
);

export const Default = Template.bind({});
Default.args = {
  Header: HeaderComponent,
  PageHeader: CurrentPageHeader,
  children: BodyComponent,
};

const RightColumnHeader = (
  <MenuTab items={['Apps', 'Automations']} onSelect={() => {}} />
);

export const SidePanelExample = Template.bind({});
SidePanelExample.args = {
  Header: RightColumnHeader,
  children: BodyComponent,
};
