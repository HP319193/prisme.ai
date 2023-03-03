import { Button, Tooltip } from '@prisme.ai/design-system';
import { FC, useCallback, useEffect, useState } from 'react';
import {
  CloseCircleOutlined,
  CompressOutlined,
  ExpandOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import LeftIcon from '../icons/chevron.svgr';
import Storage from '../utils/Storage';
import { useTranslation } from 'next-i18next';

const noop = () => null;
interface PanelProps {
  visible: boolean;
  title: string;
  onVisibleChange?: (v: boolean) => void;
  className?: string;
  onBack?: () => void;
}
export const Panel: FC<PanelProps> = ({
  visible,
  title,
  onVisibleChange = noop,
  onBack,
  className,
  children,
}) => {
  const { t } = useTranslation('workspaces');
  const [hidden, setHidden] = useState(true);
  const [large, setLarge] = useState(!!Storage.get('__panel__large'));

  useEffect(() => {
    if (hidden) {
      const t = setTimeout(() => onVisibleChange(false), 200);
      return () => {
        clearTimeout(t);
      };
    }
  }, [hidden, onVisibleChange]);

  useEffect(() => {
    setTimeout(() => setHidden(!visible), 1);
  }, [visible]);

  const toggleLarge = useCallback(() => {
    setLarge((prev) => {
      const large = !prev;
      if (large) {
        Storage.set('__panel__large', 1);
      } else {
        Storage.remove('__panel__large');
      }
      return large;
    });
  }, []);

  return (
    <div
      className={`
        ${large ? 'panel-is-large' : ''}
        flex
        absolute top-0 bottom-0 ${
          large ? 'w-full -right-full' : 'w-[30rem] -right-[30rem]'
        } z-10 flex-col
        transition-transform
        ease-in
        duration-200
        overflow-hidden
        bg-surface
        ${hidden ? '' : '-translate-x-full'}
        ${className || ''}
      `}
    >
      <div className="flex w-full items-center justify-between flex-row p-5 bg-dark-accent text-white font-semibold">
        <div className="flex items-center flex-row">
          {onBack && (
            <button
              onClick={onBack}
              className="flex mx-1 w-[20px] items-center"
            >
              <span className="flex rotate-90">
                <LeftIcon width=".8rem" height=".8rem" />
              </span>
            </button>
          )}
          {!onBack && (
            <SettingOutlined className="text-[20px] font-bold mr-3" />
          )}
          {title}
        </div>
        <div className="flex">
          <Tooltip
            title={t('panel.enlarge', { context: large ? 'off' : 'on' })}
            placement="bottom"
          >
            <Button
              variant="grey"
              className="flex justify-center items-center !text-white"
              onClick={toggleLarge}
            >
              {large ? <CompressOutlined /> : <ExpandOutlined />}
            </Button>
          </Tooltip>
          <Tooltip title={t('panel.close')} placement="bottom">
            <Button
              variant="grey"
              className="flex justify-center items-center !text-white"
              onClick={() => setHidden(true)}
            >
              <CloseCircleOutlined />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div
        className="flex flex-1 flex-col overflow-y-scroll h-full 
        border-light-gray
        border-l"
      >
        {children}
      </div>
    </div>
  );
};

export default Panel;
