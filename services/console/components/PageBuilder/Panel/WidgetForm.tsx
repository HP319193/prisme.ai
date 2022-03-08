import {
  Button,
  ListItem,
  SearchInput,
  Text,
  Space,
  Title,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import useLocalizedText from '../../../utils/useLocalizedText';
import { usePageBuilder } from '../context';
import IconApps from '../../../icons/icon-apps.svgr';
interface WidgetFormProps {
  onSubmit: (widgetSlug: string) => void;
}

export const WidgetForm = ({ onSubmit }: WidgetFormProps) => {
  const { widgets } = usePageBuilder();
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();
  const [search, setSearch] = useState('');
  const filteredWidgets = useMemo(() => {
    return widgets.flatMap(({ appName, appSlug, widgets }) => {
      const searchIn = `${appName} ${appSlug} ${widgets.map(
        ({ name, description, slug }) =>
          `${slug} ${localize(name)} ${localize(description)}`
      )}`.toLowerCase();
      if (!searchIn.match(search.toLowerCase())) return [];
      return {
        appName,
        appSlug,
        widgets: widgets.filter(({ name, description, slug }) =>
          `${localize(name)} ${localize(description)} ${slug}`
            .toLowerCase()
            .match(search.toLowerCase())
        ),
      };
    });
  }, [localize, search, widgets]);

  const isEmpty = !widgets || Object.keys(widgets).length === 0;

  if (isEmpty) {
    return (
      <div className="flex grow h-full flex-col overflow-auto">
        <Button className="flex flex-1">
          <div className="flex flex-1 justify-center items-center flex-col">
            <div className="mb-4">
              <Text>{t('pages.widgets.empty')}</Text>
            </div>
            <IconApps width={100} height={100} className="text-gray-200" />
            <div className="mt-4 text-gray">{t('apps.create.label')}</div>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex grow h-full flex-col overflow-auto">
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('pages.widgets.search')}
        className="mb-6"
      />
      <Space direction="vertical" className="flex grow overflow-x-auto">
        {filteredWidgets.map(({ appName, appSlug, widgets }) => (
          <Space key={appName} direction="vertical" className="!flex flex-1">
            {appName && (
              <Space>
                <Title level={4}>{appName}</Title>
              </Space>
            )}
            <Space direction="vertical" className="!flex flex-1">
              {widgets.map(({ slug, name, description }) => (
                <Button
                  key={`${appSlug}.${slug}`}
                  onClick={() => onSubmit(`${appSlug}.${slug}`)}
                  className="w-full text-left !h-fit"
                >
                  <ListItem
                    title={localize(name)}
                    content={localize(description)}
                  />
                </Button>
              ))}
            </Space>
          </Space>
        ))}
      </Space>
    </div>
  );
};

export default WidgetForm;
