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
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { PAGES_HOST = '' },
} = getConfig();

interface SharePageProps {
  pageId: string;
}

interface userPermissionForm {
  email: string;
}

const SharePage = ({ pageId }: SharePageProps) => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const {
    usersPermissions,
    getUsersPermissions,
    addUserPermissions,
    removeUserPermissions,
  } = usePermissions();
  const { workspace } = useWorkspace();
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
  const prevSubjectId = useRef('');
  useEffect(() => {
    if (subjectId === prevSubjectId.current) return;
    prevSubjectId.current = subjectId;
    const fetchIsPublic = async () => {
      const data = usersPermissions.get(`${subjectType}:${subjectId}`);
      if (!data) {
        return setIsPublic(false);
      }
      setIsPublic(!!data.find(({ public: p }) => p));
    };
    fetchIsPublic();
  }, [subjectId, usersPermissions]);
  const togglePublic = useCallback(
    async (isPublic: boolean) => {
      setIsPublic(isPublic);
      if (isPublic) {
        await addUserPermissions('pages', subjectId, {
          public: true,
        });
      } else {
        await removeUserPermissions('pages', subjectId, '*');
      }
    },
    [addUserPermissions, removeUserPermissions, subjectId]
  );

  const onSubmit = ({ email }: userPermissionForm) => {
    addUserPermissions(subjectType, subjectId, { email });
  };

  const link = `${PAGES_HOST}/${workspace.id}/${pageId}`;
  const copyLink = useCallback(() => {
    window.navigator.clipboard.writeText(link);
    notification.success({
      message: t('pages.share.copied'),
      placement: 'bottomRight',
    });
  }, [link, t]);

  return (
    <Space direction="vertical" className="w-[60vw]">
      <label className="flex flex-row">
        <Space className="flex flex-row">
          <Text>{t('pages.share.access')}</Text>
          <Switch
            checked={isPublic}
            onChange={togglePublic}
            checkedChildren={'Public'}
            unCheckedChildren={'privé'}
          />
        </Space>
      </label>
      <div>
        <Button variant="grey" onClick={copyLink}>
          <LinkOutlined />
          {link}
        </Button>
      </div>
      {!isPublic && (
        <>
          <Form onSubmit={onSubmit} initialValues={{ email: '', role: '' }}>
            {({ handleSubmit }) => (
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                <Text>
                  {t('pages.share.access', {
                    context: 'private',
                  })}
                </Text>
                <div className="flex flex-row flex-1 items-center">
                  <FieldContainer
                    name="email"
                    className="mx-2"
                    containerClassName="flex-1"
                  >
                    {({ input }) => (
                      <Input label={t('share.email')} {...input} />
                    )}
                  </FieldContainer>
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
    </Space>
  );
};

export default SharePage;
