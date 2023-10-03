import { Trans, useTranslation } from 'next-i18next';
import { useWorkspaceLayout } from '../../layouts/WorkspaceLayout/context';
import SuggestionButton from '../SuggestionButton';

export const EmptyActivities = () => {
  const { t } = useTranslation('workspaces');
  const { createAutomation, createPage, installApp } = useWorkspaceLayout();
  return (
    <div className="flex flex-1 justify-between flex-col p-28">
      <div className="flex flex-col flex-1 justify-center w-[17rem]">
        <Trans t={t} i18nKey="workspace.empty.title">
          <div className="font-bold text-2xl my-2">a</div>
          <div>b</div>
        </Trans>
      </div>
      <div className="flex flex-col">
        <div className="my-8">{t('workspace.empty.subtitle')}</div>
        <div className="flex flex-row">
          <SuggestionButton
            title={t('workspace.empty.suggestions.page.title')}
            text={t('workspace.empty.suggestions.page.text')}
            className="!ml-0"
            color="#F7F8D0"
            onClick={() => createPage()}
          />
          <SuggestionButton
            title={t('workspace.empty.suggestions.automation.title')}
            text={t('workspace.empty.suggestions.automation.text')}
            color="#FF9261"
            onClick={createAutomation}
          />
          <SuggestionButton
            title={t('workspace.empty.suggestions.app.title')}
            text={t('workspace.empty.suggestions.app.text')}
            color="#E7F6F6"
            onClick={installApp}
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyActivities;
