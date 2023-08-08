import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Input,
  notification,
  Space,
  Switch,
  Table,
  Text,
  Tooltip,
} from '@prisme.ai/design-system';
import { Form } from 'react-final-form';
import { useTranslation } from 'react-i18next';
import FieldContainer from '../../layouts/Field';
import { usePermissions } from '../PermissionsProvider';
import { DeleteOutlined } from '@ant-design/icons';
import { useUser } from '../UserProvider';
import { usePageEndpoint } from '../../utils/urls';
import { UserPermissions } from '../../utils/api';
import { useTracking } from '../Tracking';
import ShareButton from './ShareButton';

interface SharePageProps {
  pageId: string;
  pageSlug: string;
  workspaceId: string;
}

interface userPermissionForm {
  email: string;
}

const SharePage = ({ pageId, pageSlug, workspaceId }: SharePageProps) => {
  const { t } = useTranslation('workspaces');
  const pageHost = usePageEndpoint();
  const { user } = useUser();
  const { trackEvent } = useTracking();
  const {
    usersPermissions,
    getUsersPermissions,
    addUserPermissions,
    removeUserPermissions,
    getRoles,
    roles,
  } = usePermissions();
  const subjectType = 'pages';
  const subjectId = `${pageId}`;

  const roleNames = useMemo(() => roles.map((role) => role.name), [roles]);

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

  const initialFetch = useCallback(async () => {
    getUsersPermissions(subjectType, subjectId);
    getRoles('workspaces', workspaceId);
  }, [getUsersPermissions, subjectId, getRoles, workspaceId]);

  useEffect(() => {
    initialFetch();
  }, [initialFetch]);

  const dataSource = useMemo(() => {
    const data = usersPermissions.get(`${subjectType}:${subjectId}`);

    if (!data) {
      return [];
    }

    const rows = data
      .filter(({ target }) => !!target?.id && !target.public)
      .map(({ target }) => ({
        key: target?.id,
        displayName: target?.displayName,
        actions: generateRowButtons(() => {
          removeUserPermissions(subjectType, subjectId, target);
        }),
      }));
    return rows;
  }, [
    generateRowButtons,
    removeUserPermissions,
    subjectId,
    subjectType,
    usersPermissions,
  ]);

  const [isPublic, setIsPublic] = useState(false);
  useEffect(() => {
    const data = usersPermissions.get(`${subjectType}:${subjectId}`);
    if (!data) {
      return setIsPublic(false);
    }
    setIsPublic(!!data.find(({ target: { public: p } }) => p));
  }, [subjectId, usersPermissions]);

  const togglePublic = useCallback(
    async (isPublic: boolean) => {
      trackEvent({
        name: `Set page access ${isPublic ? 'Public' : 'Restricted'}`,
        action: 'click',
      });
      setIsPublic(isPublic);
      if (isPublic) {
        await addUserPermissions('pages', subjectId, {
          target: {
            public: true,
          },
          permissions: {
            policies: { read: true },
          },
        });
      } else {
        await removeUserPermissions('pages', subjectId, { public: true });
      }
    },
    [addUserPermissions, removeUserPermissions, subjectId, trackEvent]
  );

  const onSubmit = ({ email }: userPermissionForm) => {
    let target: UserPermissions['target'] = { email };
    if (roleNames.includes(email)) {
      target = { role: email };
    } else if (email === user.email) {
      notification.warning({
        message: t('pages.share.notme'),
        placement: 'bottomRight',
      });
      return;
    }
    trackEvent({
      name: 'Add a permission',
      action: 'click',
    });
    addUserPermissions(subjectType, subjectId, {
      target,
      permissions: {
        policies: { read: true },
      },
    });
  };

  const link = `${pageHost}/${pageSlug}`;

  return (
    <div className="w-[44rem] space-y-5">
      <div className="flex flex-row">
        <div className="flex flex-row">
          <Space className="flex flex-row">
            <Text>{t('pages.share.access')}</Text>
            <Switch
              checked={isPublic}
              onChange={togglePublic}
              checkedChildren={t('pages.public')}
              unCheckedChildren={t('pages.private')}
            />
          </Space>
        </div>
        <ShareButton link={link} />
      </div>
      {!isPublic && (
        <>
          <Form onSubmit={onSubmit} initialValues={{ email: '' }}>
            {({ handleSubmit }) => (
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                <div className="font-semibold">
                  {t('pages.share.access', {
                    context: 'private',
                  })}
                </div>
                <div className="flex flex-row flex-1 items-end">
                  <FieldContainer
                    name="email"
                    containerClassName="flex-1 !ml-0 !mb-0 !mt-[0.635rem] flex-row"
                  >
                    {({ input }) => (
                      <>
                        <Input label={t('share.emailOrRole')} {...input} />
                      </>
                    )}
                  </FieldContainer>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex items-center justify-center !w-[9.375rem] !h-[2.5rem] !rounded-[0.94rem]"
                  >
                    {t('add', { ns: 'common' })}
                  </Button>
                </div>
              </form>
            )}
          </Form>
          <Table
            dataSource={dataSource}
            columns={[
              {
                title: t('share.displayName'),
                dataIndex: 'displayName',
                key: 'displayName',
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
        </>
      )}
    </div>
  );
};

export default SharePage;
