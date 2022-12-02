import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Input,
  notification,
  Select,
  Table,
  Tooltip,
} from '@prisme.ai/design-system';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../PermissionsProvider';
import { DeleteOutlined } from '@ant-design/icons';
import { useUser } from '../UserProvider';
import { useRouter } from 'next/router';
import { useWorkspace } from '../../providers/Workspace';

interface SharePopoverProps {
  subjectType: PrismeaiAPI.GetPermissions.Parameters.SubjectType;
  subjectId: string;
}

type SelectOption = {
  value: Prismeai.Role;
  label: string;
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
  const {
    deleteWorkspace,
    workspace: { name },
  } = useWorkspace();
  const { push } = useRouter();

  const rolesOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'owner', label: t('share.roles.owner') },
      { value: 'editor', label: t('share.roles.editor') },
    ],
    [t]
  );

  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<Prismeai.Role>(
    rolesOptions[0].value
  );

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

  const initialFetch = useRef(async () => {
    getUsersPermissions(subjectType, subjectId);
  });

  useEffect(() => {
    initialFetch.current();
  }, [initialFetch]);

  const userId = user?.id;

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
          if (id === userId) {
            // User is removing himself his access to the workspace
            push('/workspaces');
            deleteWorkspace();
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
    userId,
    usersPermissions,
  ]);

  const onSubmit = useCallback(() => {
    if (emailInput === user.email) {
      notification.warning({
        message: t('share.notme'),
        placement: 'bottomRight',
      });
      return;
    }
    addUserPermissions(subjectType, subjectId, {
      email: emailInput,
      role: roleInput,
    });
  }, [
    addUserPermissions,
    emailInput,
    roleInput,
    subjectId,
    subjectType,
    t,
    user.email,
  ]);

  return (
    <div className="w-[42rem] space-y-5">
      <div className="flex flex-grow flex-row items-center justify-center">
        <Input
          placeholder={t('share.email')}
          value={emailInput}
          onChange={({ target: { value } }) => setEmailInput(value)}
          className="!rounded-r-[0] !border-r-[0] !rounded-l-[0.94rem]"
          overrideContainerClassName="flex-grow"
        />
        <Select
          value={roleInput}
          onChange={(value) => {
            setRoleInput(value);
          }}
          selectOptions={rolesOptions}
          className="w-40 pr-noLeftSelect"
          overrideContainerClassName="flex mr-2"
        />
        <Button
          type="submit"
          variant="primary"
          onClick={onSubmit}
          className="flex items-center justify-center !w-[9.375rem] !h-[2.5rem] !rounded-[0.94rem]"
        >
          {commonT('add')}
        </Button>
      </div>
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
    </div>
  );
};

export default ShareWorkspacePopover;
