import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import useLocalizedText from '../../utils/useLocalizedText';
import CardButton, { CardButtonProps } from './CardButton';
import icon from '../../icons/icon-workspace.svg';
import { useUser } from '../UserProvider';
import { Tooltip } from 'antd';
import { Button } from '@prisme.ai/design-system';
import { FC } from 'react';
import { Workspace } from '../../utils/api';
import WorkspaceIcon from './WorkspaceIcon';

interface WorkspaceCardButtonProps extends CardButtonProps {
  workspace: Workspace;
  href?: string;
}
export const WorkspaceCardButton: FC<WorkspaceCardButtonProps> = ({
  workspace: { description, createdBy, photo, name },
  href,
  children,
  className = '',
  ...props
}) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { user } = useUser();
  const descriptionDisplayed =
    localize(description) ||
    (user && user.id === createdBy && t('workspaces.defaultDescription')) ||
    '';
  return (
    <CardButton
      href={href}
      className={`p-6 flex border-light-gray border-2 bg-white items-center !justify-start relative ${className}`}
      {...props}
    >
      <span className="flex min-w-[50px]">
        <WorkspaceIcon photo={photo} name={name} />
      </span>
      <span className="flex ml-4 flex-col items-start">
        <Tooltip title={name}>
          <div className="overflow-hidden whitespace-nowrap text-ellipsis mb-0 max-w-full font-bold">
            {name}
          </div>
        </Tooltip>
        <Tooltip title={descriptionDisplayed}>
          <div className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[15rem]">
            {descriptionDisplayed}
          </div>
        </Tooltip>
        {href && (
          <Button variant="link" className="!p-0 !h-[unset]">
            {t('edit.label')}
          </Button>
        )}
      </span>
      {children}
    </CardButton>
  );
};

export default WorkspaceCardButton;
