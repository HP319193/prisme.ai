import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Button, Input, Table, Space } from '@prisme.ai/design-system';
import { Form } from 'react-final-form';
import { useTranslation } from 'react-i18next';
import FieldContainer from '../layouts/Field';
import UserPermissions = Prismeai.UserPermissions;
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { usePermissions } from './PermissionsProvider';
import Role = Prismeai.Role;

interface SharePopoverProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
}

interface userPermissionForm {
  email: string;
  role: Role;
}

const SharePopover = ({ setVisible }: SharePopoverProps) => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const { usersPermissions, getUsersPermissions, addUserPermissions } =
    usePermissions();
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
    return [];
  }, []);

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
          { title: t('share.access'), dataIndex: 'access', key: 'access' },
          {
            title: t('share.role'),
            dataIndex: 'role',
            key: 'role',
          },
          {
            title: t('share.actions'),
            dataIndex: 'actions',
            key: 'actions',
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
