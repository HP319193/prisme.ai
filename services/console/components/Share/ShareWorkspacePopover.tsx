import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  Input,
  Select,
  Space,
  Table,
  Tooltip,
  notification,
} from '@prisme.ai/design-system';
import { Form, useField } from 'react-final-form';
import { useTranslation } from 'react-i18next';
import FieldContainer from '../../layouts/Field';
import { usePermissions } from '../PermissionsProvider';
import { DeleteOutlined } from '@ant-design/icons';
import { useUser } from '../UserProvider';
import { useWorkspaces } from '../WorkspacesProvider';
import { useRouter } from 'next/router';
import { useWorkspace } from '../../layouts/WorkspaceLayout';

interface SharePopoverProps {
  subjectType: PrismeaiAPI.GetPermissions.Parameters.SubjectType;
  subjectId: string;
}

interface userPermissionForm {
  email: string;
  role: Prismeai.Role;
}

type SelectOption = {
  value: string;
  label: string;
};

const RoleSelect = ({
  rolesOptions,
  t,
}: {
  rolesOptions: SelectOption[];
  t: Function;
}) => {
  const { input: roleInput } = useField('role', {
    initialValue: rolesOptions[0].value,
  });

  return (
    <Select
      {...roleInput}
      selectOptions={rolesOptions}
      label={t('share.role')}
      className="w-40"
    />
  );
};

const ShareWorkspacePopover = ({
  subjectType,
  subjectId,
}: SharePopoverProps) => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const {
    usersPermissions,
    getUsersPermissions,
    addUserPermissions,
    removeUserPermissions,
  } = usePermissions();
  const { user } = useUser();
  const { remove } = useWorkspaces();
  const {
    workspace: { name },
  } = useWorkspace();
  const { push } = useRouter();

  const generateRowButtons = useCallback(
    (onDelete: Function) => (
      <div className="flex flex-row justify-center">
        <Tooltip title={t('share.delete')}>
          <Button onClick={() => onDelete()}>
            <DeleteOutlined />
          </Button>
        </Tooltip>
      </div>
    ),
    [t]
  );

  const rolesOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'owner', label: t('share.roles.owner') },
      { value: 'editor', label: t('share.roles.editor') },
    ],
    [t]
  );

  const initialFetch = useRef(async () => {
    getUsersPermissions(subjectType, subjectId);
  });

  useEffect(() => {
    initialFetch.current();
  }, [initialFetch]);

  const dataSource = useMemo(() => {
    const data = usersPermissions.get(`${subjectType}:${subjectId}`);

    if (!data) {
      return [];
    }

    const rows = data
      .filter(({ id }) => !!id && id != '*') // Public permission has id='*'
      .map(({ email, role, id }) => ({
        key: id,
        email,
        role,
        actions: generateRowButtons(() => {
          if (!id) return;
          if (id === user.id) {
            // User is removing himself his access to the workspace
            push('/workspaces');
            remove({ id: subjectId }, true);
            notification.success({
              message: t('share.leave', { name }),
              placement: 'bottomRight',
            });
          }
          removeUserPermissions(subjectType, subjectId, id);
        }),
      }));

    return rows;
  }, [
    generateRowButtons,
    name,
    push,
    remove,
    removeUserPermissions,
    subjectId,
    subjectType,
    t,
    user.id,
    usersPermissions,
  ]);

  const onSubmit = ({ email, role }: userPermissionForm) => {
    addUserPermissions(subjectType, subjectId, { email, role });
  };

  return (
    <Space direction="vertical" className="w-[60vw]">
      <Form onSubmit={onSubmit} initialValues={{ email: '', role: '' }}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="flex flex-1">
            <div className="flex flex-row flex-1 items-center">
              <FieldContainer
                name="email"
                className="mx-2"
                containerClassName="flex-1"
              >
                {({ input }) => <Input label={t('share.email')} {...input} />}
              </FieldContainer>
              <div className="mb-5">
                <span className={`flex flex-col`}>
                  <RoleSelect rolesOptions={rolesOptions} t={t} />
                </span>
              </div>
              <Button type="submit">{commonT('add')}</Button>
            </div>
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

export default ShareWorkspacePopover;
