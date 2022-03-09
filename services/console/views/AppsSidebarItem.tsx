import Form from '../components/SchemaForm/Form';
import { Collapse, ListItem } from '@prisme.ai/design-system';
import { ReactElement, useMemo } from 'react';
import Block from '../components/Block';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import api from '../utils/api';
import { SettingOutlined } from '@ant-design/icons';

const AppsSidebarItem = ({
  slug = '',
  config: { schema, value, widget } = {},
}: Prismeai.AppInstance) => {
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const configComponent: ReactElement | null = useMemo(() => {
    if (schema) {
      return <Form schema={schema} onSubmit={() => {}} initialValues={value} />;
    }
    if (widget) {
      return (
        <Block
          url={widget}
          entityId={slug}
          token={`${api.token}`}
          workspaceId={workspaceId}
          appInstance={slug}
        />
      );
    }
    return null;
  }, [schema, slug, value, widget, workspaceId]);

  if (!configComponent) return <ListItem title={slug} />;

  return (
    <Collapse
      light
      key={slug}
      items={[
        {
          label: `${slug}`,
          content: configComponent,
        },
      ]}
      icon={({ isActive }) => (
        <SettingOutlined className={`${isActive ? '!text-accent' : ''}`} />
      )}
    />
  );
};

export default AppsSidebarItem;
