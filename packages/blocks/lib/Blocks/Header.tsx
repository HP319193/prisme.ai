import { Menu } from '@prisme.ai/design-system';
import '../i18n';
import tw from '../tw';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';

import { withI18nProvider } from '../i18n';

interface Config {
  title?: string;
  logo?: {
    src: string;
    alt: string;
  };
  nav: {
    text: string;
    type: 'external' | 'internal' | 'inside' | 'event';
    value: string;
    edit: boolean;
  }[];
}

const Button = ({ text, type, value, edit }: Config['nav'][number]) => {
  const { events } = useBlock<Config>();
  const {
    components: { Link },
  } = useBlocks();
  switch (type) {
    case 'event':
      return (
        <button
          onClick={() => {
            if (edit) return;
            if (!events || !value) return;
            events.emit(value);
          }}
          className={tw`block-header__nav-item-button`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    case 'external':
    case 'internal':
      return (
        <Link
          href={edit ? '' : value}
          className={tw`block-header__nav-item-link`}
        >
          <button
            className={tw`block-header__nav-item-button`}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </Link>
      );
    case 'inside':
      return (
        <a
          href={edit ? '' : `#${value}`}
          className={tw`block-header__nav-item-link`}
        >
          <button
            className={tw`block-header__nav-item-button`}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </a>
      );
    default:
      return null;
  }
};

export const Header = ({ edit }: { edit?: boolean }) => {
  const { config = {} as Config, events } = useBlock<Config>();
  const {
    components: { Link },
  } = useBlocks();

  const nav = config.nav && Array.isArray(config.nav) ? config.nav : [];

  return (
    <div
      className={tw`block-header flex flex-1 justify-between md:items-center`}
    >
      <div className={tw`block-header__left left flex min-w-[6.25rem]`}>
        <div className={tw`left__logo logo flex justify-center`}>
          {config.logo && config.logo.src && (
            <img
              src={config.logo.src}
              alt={config.logo.alt}
              className={tw`logo__image image max-h-12`}
            />
          )}
        </div>
        <h1 className={tw`left__title title flex items-center m-0 font-bold`}>
          {config.title}
        </h1>
      </div>
      <Menu
        items={nav.map((props, k) => ({
          label: (
            <Button
              type={props.type}
              value={props.value}
              text={props.text}
              edit={!!edit}
            />
          ),
          key: `${k}`,
        }))}
        onClick={(e) => {}}
        style={{
          width: '65%',
          justifyContent: 'flex-end',
          color: 'var(--color-text)',
        }}
      />
    </div>
  );
};

export default withI18nProvider(Header);
