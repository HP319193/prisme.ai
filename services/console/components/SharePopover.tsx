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
import Policies = Prismeai.Policies;
import { useWorkspaces } from './WorkspacesProvider';
import UserPermissions = Prismeai.UserPermissions;
import { useWorkspace } from '../layouts/WorkspaceLayout';

interface SharePopoverProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
}

const SharePopover = ({ setVisible }: SharePopoverProps) => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const { getWorkspaceUsersPermissions } = useWorkspaces();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const [workspaceUsers, setWorkspaceUsers] = useState<UserPermissions[]>([]);

  const initialFetch = useCallback(async () => {
    console.log('fetch');
    const users = await getWorkspaceUsersPermissions(workspaceId);
    console.log('fetched', users);
    setWorkspaceUsers(users);
  }, [getWorkspaceUsersPermissions, workspaceId]);

  useEffect(() => {
    initialFetch();
  }, [initialFetch]);

  const dataSource = useMemo(() => {
    return [];
  }, []);

  const onSubmit = (values) => {};

  return (
    <Space direction="vertical" className="w-[60vw]">
      <Form onSubmit={onSubmit} initialValues={workspaceUsers}>
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
