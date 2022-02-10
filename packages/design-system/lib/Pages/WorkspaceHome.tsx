// import { Header, Layout, Row, Col, AutomationsList, MenuTab } from '../';
// import { useTranslation } from 'react-i18next';
import React from 'react';
// import SidePanel from '../Groups/SidePanel';
// import { WorkspaceFeed } from '../';
// import { FeedSection } from '../Groups/WorkspaceFeed';
// // @ts-ignore
// import icon from '../../../../services/console/icons/icon-prisme.svg';

export interface WorkspaceHomeProps {}

const WorkspaceHome = () => null;

// const WorkspaceHome = ({}: any) => {
//   const { t } = useTranslation('workspaces');
//
//   // Start hooks mocks
//   const workspacesNames = [
//     { label: 'mon premier workspace', key: '1' },
//     { label: 'mon second workspace', key: '2' },
//   ];
//   const user = {
//     name: 'John Doe',
//     avatar:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/240px-User-avatar.svg.png',
//   };
//
//   // importing mockData crash storybook ??
//   const sections: FeedSection[] = [
//     {
//       title: 'TODAY',
//       content: [
//         {
//           label: 'New contact on Hubspot',
//           content: 'John doe is requesting a demo',
//         },
//         {
//           label: 'New email from Nathan',
//           content: 'Hello, I just wanted to spam your inbox',
//         },
//       ],
//     },
//     {
//       title: 'Yesterday',
//       content: [
//         {
//           label: 'New contact on Hubspot',
//           content: 'John doe is requesting a demo',
//         },
//         {
//           label: 'New email from Nathan',
//           content: 'Hello, I just wanted to spam your inbox',
//         },
//       ],
//     },
//   ];
//   // End hooks mocks
//
//   return (
//     <Layout
//       Header={
//         <Header
//           workspaces={workspacesNames}
//           t={(text: string) => text}
//           userName={user.name}
//           userAvatar={user.avatar}
//           icon={<img src={icon} />}
//         />
//       }
//     >
//       <Row className="grow">
//         <Col span={16} className="flex h-full">
//           <WorkspaceFeed sections={sections} />
//         </Col>
//         <Col span={8} className="flex h-full">
//           <SidePanel
//             Header={
//               <MenuTab items={['Apps', 'Automations']} onSelect={() => {}} />
//             }
//           >
//             <AutomationsList
//               automations={[
//                 { title: 'Mail', content: 'Réponse automatique vacances' },
//                 { title: 'Bot', content: 'Gérer compte client' },
//                 { title: 'Mail', content: 'Réponse automatique vacances' },
//                 { title: 'Bot', content: 'Gérer compte client' },
//                 { title: 'Mail', content: 'Réponse automatique vacances' },
//                 { title: 'Bot', content: 'Gérer compte client' },
//                 { title: 'Mail', content: 'Réponse automatique vacances' },
//                 { title: 'Bot', content: 'Gérer compte client' },
//                 { title: 'Mail', content: 'Réponse automatique vacances' },
//                 { title: 'Bot', content: 'Gérer compte client' },
//                 { title: 'Mail', content: 'Réponse automatique vacances' },
//                 { title: 'Bot', content: 'Gérer compte client' },
//                 { title: 'Mail', content: 'Réponse automatique vacances' },
//                 { title: 'Bot', content: 'Gérer compte client' },
//                 { title: 'Mail', content: 'Réponse automatique vacances' },
//                 { title: 'Bot', content: 'Gérer compte client' },
//               ]}
//             />
//           </SidePanel>
//         </Col>
//       </Row>
//     </Layout>
//   );
// };

export default WorkspaceHome;
