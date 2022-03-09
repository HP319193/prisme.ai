import Form from '../components/SchemaForm/Form';
import { Collapse, ListItem } from '@prisme.ai/design-system';
import { memo, ReactElement, useMemo } from 'react';
import Block from '../components/Block';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import api from '../utils/api';
import { SettingOutlined } from '@ant-design/icons';

interface AppsSidebarItemProps extends Prismeai.AppInstance {
  workspaceId: string;
  onToggle: (app: string, state: boolean) => void;
}

const AppsSidebarItem = ({
  workspaceId,
  slug = '',
  config: { schema, value, widget } = {},
  onToggle,
}: AppsSidebarItemProps) => {
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
      icon={({ isActive }) => {
        // Timeout to avoid set state while rendering
        setTimeout(() => onToggle(slug, !!isActive));
        return (
          <SettingOutlined className={`${isActive ? '!text-accent' : ''}`} />
        );
      }}
    />
  );
};

export default memo(AppsSidebarItem);
