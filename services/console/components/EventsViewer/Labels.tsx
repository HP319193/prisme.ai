import { WarningOutlined } from '@ant-design/icons';
import { Button } from '@prisme.ai/design-system';
import { Popconfirm } from 'antd';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { FC } from 'react';
import { Event } from '../../utils/api';
import { useWorkspace } from '../WorkspaceProvider';

export const AutomationLabel: FC<Event<Date>> = ({
  children,
  source,
  payload,
}) => {
  const { workspace } = useWorkspace();

  if (source.appSlug) {
    return <span className="font-bold">{children}</span>;
  }
  const automationSlug =
    payload.slug || payload.automationSlug || source.automationSlug;
  const automationExists = !!workspace?.automations?.[automationSlug];

  if (automationExists) {
    return (
      <Link
        href={`/workspaces/${source.workspaceId}/automations/${automationSlug}`}
      >
        <a className="font-bold">{children}</a>
      </Link>
    );
  }
  return <span className="font-bold">{children}</span>;
};

export const PageLabel: FC<Event<Date>> = ({ children, payload, source }) => {
  return (
    <Link href={`/workspaces/${source.workspaceId}/pages/${payload.page.id}`}>
      <a className="font-bold">{children}</a>
    </Link>
  );
};

export const AppLabel: FC<Event<Date>> = ({ children, payload, source }) => {
  return (
    <Link
      href={`/workspaces/${source.workspaceId}/apps/${payload?.appInstance?.appName}`}
    >
      <a className="font-bold">{children}</a>
    </Link>
  );
};

export const ErrorLabel: FC<Event<Date>> = ({ children, type }) => {
  return (
    <div className="flex items-center">
      <span className="flex mr-[0.5rem] text-pr-orange">
        <WarningOutlined />
      </span>
      <span className="flex">{children}</span>
    </div>
  );
};

export const EventLabel: FC<Event<Date>> = ({ children }) => {
  return <span className="font-bold">{children}</span>;
};

export const RollbackVersion: FC<Event<Date>> = ({ children }) => {
  const { t } = useTranslation('workspaces');
  return (
    <Popconfirm
      title={t('workspace.versions.rollback.confirm')}
      okText={t('workspace.versions.rollback.confirm_ok')}
      cancelText={t('workspace.versions.rollback.confirm_cancel')}
      onCancel={(e) => e?.stopPropagation()}
      onConfirm={(e) => {
        e?.stopPropagation();
        console.log('go rollback', e);
      }}
    >
      <Button className="font-bold" onClick={(e) => e.stopPropagation()}>
        {children}
      </Button>
    </Popconfirm>
  );
};
