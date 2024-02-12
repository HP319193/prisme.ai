import { Button, Tooltip } from '@prisme.ai/design-system';
import { ButtonProps } from '@prisme.ai/design-system/lib/Components/Button';
import { TooltipProps } from 'antd';
import { useTranslation } from 'next-i18next';
import { ReactNode, useRef } from 'react';

interface ConfirmButtonProps extends ButtonProps {
  children: ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  yesLabel?: string;
  noLabel?: string;
  placement?: TooltipProps['placement'];
  ButtonComponent?: string | React.ComponentType<ButtonProps>;
}
export const ConfirmButton = ({
  children,
  onConfirm,
  confirmLabel,
  yesLabel,
  noLabel,
  placement,
  ButtonComponent = Button,
  ...props
}: ConfirmButtonProps) => {
  const tooltipRef = useRef<{ close: () => void }>(null);
  const { t } = useTranslation('common');
  return (
    <Tooltip
      ref={tooltipRef}
      title={
        <div>
          <div>{confirmLabel}</div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="grey"
              onClick={() => {
                onConfirm();
                tooltipRef.current?.close();
              }}
            >
              {yesLabel || t('yes')}
            </Button>
            <Button type="button" onClick={() => tooltipRef.current?.close()}>
              {noLabel || t('no')}
            </Button>
          </div>
        </div>
      }
      trigger={['click']}
      color="var(--warning-color)"
      placement={placement}
    >
      <ButtonComponent className="!text-warning" {...props}>
        {children}
      </ButtonComponent>
    </Tooltip>
  );
};
export default ConfirmButton;
