import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Button, Input, Table, Space } from '@prisme.ai/design-system';
import { Tooltip } from 'antd';
import { Form } from 'react-final-form';
import { useTranslation } from 'react-i18next';
import FieldContainer from '../layouts/Field';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { usePermissions } from './PermissionsProvider';
import Role = Prismeai.Role;
import { DeleteOutlined } from '@ant-design/icons';

interface SharePopoverProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
}

interface userPermissionForm {
  email: string;
  role: Role;
}

const generateRowButtons = (t: Function, onDelete: Function) => (
  <div className="flex flex-row justify-center">
    <Tooltip title={t('share.delete')}>
      <Button onClick={() => onDelete()}>
        <DeleteOutlined />
      </Button>
    </Tooltip>
  </div>
);

const SharePopover = ({ setVisible }: SharePopoverProps) => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const {
    usersPermissions,
    getUsersPermissions,
    addUserPermissions,
    removeUserPermissions,
  } = usePermissions();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();

  console.log('usersPermissions', usersPermissions);

  const initialFetch = useCallback(async () => {
    getUsersPermissions('workspaces', workspaceId);
  }, [getUsersPermissions, workspaceId]);

  useEffect(() => {
    initialFetch();
  }, [initialFetch]);

  const dataSource = useMemo(() => {
    const data = usersPermissions.get(workspaceId);
    if (!data) {
      return [];
    }
    const rows = data
      .filter(({ id }) => !!id)
      .map(({ email, role, id }) => ({
        key: id,
        email,
        role,
        actions: generateRowButtons(t, () =>
          // @ts-ignore
          // Previous filter ensure we have an id defined
          removeUserPermissions('workspaces', workspaceId, id)
        ),
      }));
    return rows;
  }, [removeUserPermissions, t, usersPermissions, workspaceId]);

  const onSubmit = ({ email, role }: userPermissionForm) => {
    addUserPermissions('workspaces', workspaceId, { email, role });
  };

  return (
    <Space direction="vertical" className="w-[60vw]">
      <Form onSubmit={onSubmit} initialValues={{ email: '', role: '' }}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Space className="flex flex-row">
              <FieldContainer name="email">
                {({ input }) => <Input label={t('share.email')} {...input} />}
              </FieldContainer>
              <FieldContainer name="role">
                {({ input }) => <Input label={t('share.role')} {...input} />}
              </FieldContainer>
              <Button type="submit">{commonT('add')}</Button>
            </Space>
          </form>
        )}
      </Form>
      <Table
        dataSource={dataSource}
        columns={[
          { title: t('share.email'), dataIndex: 'email', key: 'email' },
          {
            title: t('share.role'),
            dataIndex: 'role',
            key: 'role',
          },
          {
            title: t('share.actions'),
            dataIndex: 'actions',
            key: 'actions',
            width: '15%',
          },
        ]}
        bordered
        pagination={{ pageSize: 10, position: [] }}
        scroll={{ y: 500 }}
      />
    </Space>
  );
};

export default SharePopover;
