import tw from '../../tw';
import { Tooltip } from '@prisme.ai/design-system';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ScrollElementsProps {
  scroll: (step: number) => () => void;
}

const ScrollElements = ({ scroll }: ScrollElementsProps) => {
  const { t } = useTranslation();

  return (
    <div className={`${tw`block-cards__scroll text-accent text-l`}`}>
      <div
        className={tw`block-cards__scroll__left absolute flex justify-center top-16 left-6 h-8 w-8 bg-white rounded-[100%] shadow-lg`}
      >
        <Tooltip title={t('cards.prev')} placement="right">
          <button
            onClick={scroll(-1)}
            className={'block-cards__scroll__left__button outline-none'}
          >
            <LeftOutlined
              className={tw`block-cards__scroll__left__button__icon bg-white rounded-[50%]`}
            />
          </button>
        </Tooltip>
      </div>
      <div
        className={tw`block-cards__scroll__right absolute flex justify-center top-16 right-6 h-8 w-8 bg-white rounded-[100%] shadow-lg`}
      >
        <Tooltip title={t('cards.next')} placement="left">
          <button
            onClick={scroll(1)}
            className={tw`block-cards__scroll__right__button outline-none`}
          >
            <RightOutlined
              className={tw`block-cards__scroll__right__button__icon bg-white rounded-[50%]`}
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ScrollElements;
