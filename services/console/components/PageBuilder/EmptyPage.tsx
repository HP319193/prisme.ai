import { Trans, useTranslation } from 'next-i18next';
import plus from '../../icons/plus.svg';

interface SuggestionButtonProps {
  title: string;
  text: string;
  className?: string;
  color?: string;
  onClick?: () => void;
}

const SuggestionButton = ({
  title,
  text,
  className,
  color,
  onClick,
}: SuggestionButtonProps) => {
  return (
    <button
      className={`
        focus:outline-none
        flex flex-col rounded flex-1 m-2 p-4 text-sm text-left justify-between
        transition-all group
        hover:shadow-2xl hover:-translate-y-2
        ${className}
      `}
      style={{
        backgroundColor: color,
      }}
      onClick={onClick}
    >
      <div className="flex flex-col">
        <div className="font-bold mb-2">{title}</div>
        <div className="relative min-h-[55px]">
          <div className="transition-all opacity-100 group-hover:opacity-0">
            {text}
          </div>
          <div
            className="
            absolute top-0
        flex flex-row mt-4 py-2 px-4 rounded text-3xl
        bg-[white] transition-all whitespace-nowrap overflow-hidden
          opacity-0 group-hover:opacity-100
          "
            style={{ color }}
          >
            +
          </div>
        </div>
      </div>
    </button>
  );
};

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
