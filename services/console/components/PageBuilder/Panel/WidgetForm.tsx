import { Button, ListItem, SearchInput } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import useLocalizedText from '../../../utils/useLocalizedText';
import { usePageBuilder } from '../context';

interface WidgetFormProps {
  onSubmit: (widgetSlug: string) => void;
}

export const WidgetForm = ({ onSubmit }: WidgetFormProps) => {
  const { widgets } = usePageBuilder();
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();
  const [search, setSearch] = useState('');
  const filteredWidgets = useMemo(() => {
    return Object.keys(widgets)
      .map((slug) => ({
        ...widgets[slug],
        name: localize(slug),
        description: localize(widgets[slug].description),
        slug,
      }))
      .filter(({ name, description }) => {
        const matching = `${name} ${description}`
          .toLowerCase()
          .match(search.toLowerCase());
        return !!matching;
      });
  }, [localize, search, widgets]);

  return (
    <div className="flex grow h-full flex-col overflow-auto">
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('pages.instruction.search')}
        className="mb-6"
      />
      {filteredWidgets.map(({ slug, name, description }) => (
        <Button
          key={slug}
          onClick={() => onSubmit(slug)}
          className="w-full text-left !h-fit !px-0"
        >
          <ListItem
            title={<span className="flex align-left">name</span>}
            content={description}
          />
        </Button>
      ))}
    </div>
  );
};

export default WidgetForm;
