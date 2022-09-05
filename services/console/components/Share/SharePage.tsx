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
import { DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { useUser } from '../UserProvider';
import { usePageEndpoint } from '../../utils/urls';

interface SharePageProps {
  pageId: string;
  pageSlug: string;
}

interface userPermissionForm {
  email: string;
}

const SharePage = ({ pageId, pageSlug }: SharePageProps) => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const pageHost = usePageEndpoint();
  const { user } = useUser();
  const {
    usersPermissions,
    getUsersPermissions,
    addUserPermissions,
    removeUserPermissions,
  } = usePermissions();
  const subjectType = 'pages';
  const subjectId = `${pageId}`;

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
  }, [getUsersPermissions, subjectType, subjectId]);

  useEffect(() => {
    initialFetch();
  }, [initialFetch]);

  const dataSource = useMemo(() => {
    const data = usersPermissions.get(`${subjectType}:${subjectId}`);

    if (!data) {
      return [];
    }

    const rows = data
      .filter(({ id }) => !!id && id != '*') // Public permission has id='*'
      .map(({ email, id }) => ({
        key: id,
        email,
        actions: generateRowButtons(() => {
          if (!id) return;
          removeUserPermissions(subjectType, subjectId, id);
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
    setIsPublic(!!data.find(({ public: p }) => p));
  }, [subjectId, usersPermissions]);

  const togglePublic = useCallback(
    async (isPublic: boolean) => {
      setIsPublic(isPublic);
      if (isPublic) {
        await addUserPermissions('pages', subjectId, {
          public: true,
          policies: { read: true },
        });
      } else {
        await removeUserPermissions('pages', subjectId, '*');
      }
    },
    [addUserPermissions, removeUserPermissions, subjectId]
  );

  const onSubmit = ({ email }: userPermissionForm) => {
    if (email === user.email) {
      notification.warning({
        message: t('pages.share.notme'),
        placement: 'bottomRight',
      });
      return;
    }
    addUserPermissions(subjectType, subjectId, {
      email,
      policies: { read: true },
    });
  };

  const link = `${pageHost}/${pageSlug}`;
  const copyLink = useCallback(() => {
    window.navigator.clipboard.writeText(link);
    notification.success({
      message: t('pages.share.copied'),
      placement: 'bottomRight',
    });
  }, [link, t]);

  return (
    <div className="w-[42rem] space-y-5">
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
        <Button variant="grey" onClick={copyLink}>
          <LinkOutlined />
          {link}
        </Button>
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
                        <Input label={t('share.email')} {...input} />
                      </>
                    )}
                  </FieldContainer>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex items-center justify-center !w-[9.375rem] !h-[50px] !rounded-[0.94rem]"
                  >
                    {commonT('add')}
                  </Button>
                </div>
              </form>
            )}
          </Form>
          <Table
            dataSource={dataSource}
            columns={[
              { title: t('share.email'), dataIndex: 'email', key: 'email' },
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
