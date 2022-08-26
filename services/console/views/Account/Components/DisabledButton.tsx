import { Tooltip } from 'antd';
import React from 'react';
import { useTranslation } from 'next-i18next';

export const DisabledButton = ({ children }: { children: string }) => {
  const { t } = useTranslation('user');

  return (
    <div className="ant-btn ant-btn-link !flex items-center justify-start !p-0 !text-[0.75rem] ml-2 !text-gray !cursor-not-allowed underline">
      <Tooltip title={t('coming_soon')}>
        <div>{children}</div>
      </Tooltip>
    </div>
  );
};
