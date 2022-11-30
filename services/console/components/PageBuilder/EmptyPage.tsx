import { Trans, useTranslation } from 'next-i18next';
import plus from '../../icons/plus.svg';
import SuggestionButton from '../SuggestionButton';

interface EmptyPageProps {
  onAddBlock?: (blockName?: string) => void;
}

export const EmptyPage = ({ onAddBlock }: EmptyPageProps) => {
  const { t } = useTranslation('workspaces');
  return (
    <div className="flex flex-1 justify-between flex-col p-28">
      <div className="flex flex-col flex-1 justify-center w-[15rem]">
        <Trans t={t} i18nKey="pages.empty.title">
          <div className="font-bold text-2xl my-2">a</div>
          <div>b</div>
        </Trans>
        <div>
          <button
            className="flex flex-row bg-accent mt-4 p-4 rounded transition-all whitespace-nowrap overflow-hidden"
            onClick={() => onAddBlock && onAddBlock()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={plus.src} alt="" className="w-[15px] h-[15px] m-1" />
          </button>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="my-8">{t('pages.empty.subtitle')}</div>
        <div className="flex flex-row">
          <SuggestionButton
            title={t('pages.empty.suggestions.header.title')}
            text={t('pages.empty.suggestions.header.text')}
            className="!ml-0"
            color="#F7F8D0"
            onClick={() => onAddBlock && onAddBlock('Header')}
          />
          <SuggestionButton
            title={t('pages.empty.suggestions.cards.title')}
            text={t('pages.empty.suggestions.cards.text')}
            color="#FF9261"
            onClick={() => onAddBlock && onAddBlock('Cards')}
          />
          <SuggestionButton
            title={t('pages.empty.suggestions.richtext.title')}
            text={t('pages.empty.suggestions.richtext.text')}
            color="#E7F6F6"
            onClick={() => onAddBlock && onAddBlock('RichText')}
          />
          <SuggestionButton
            title={t('pages.empty.suggestions.form.title')}
            text={t('pages.empty.suggestions.form.text')}
            className="!mr-0"
            color="#F1ECFF"
            onClick={() => onAddBlock && onAddBlock('Form')}
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyPage;
