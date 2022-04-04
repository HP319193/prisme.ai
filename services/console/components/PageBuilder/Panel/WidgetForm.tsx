import {
  Button,
  ListItem,
  SearchInput,
  Space,
  Title,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import useLocalizedText from '../../../utils/useLocalizedText';
import { usePageBuilder } from '../context';
import IconApps from '../../../icons/icon-apps.svgr';
import Link from 'next/link';
import { useWorkspace } from '../../../layouts/WorkspaceLayout';
import * as BuiltinBlocks from '../../Blocks';

interface WidgetFormProps {
  onSubmit: (widgetSlug: string) => void;
}

export const WidgetForm = ({ onSubmit }: WidgetFormProps) => {
  const { widgets } = usePageBuilder();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();
  const [search, setSearch] = useState('');
  const filteredWidgets = useMemo(() => {
    return [
      {
        appName: 'Built-In',
        slug: '',
        widgets: Object.keys(BuiltinBlocks).map(
          (name) =>
            ({
              name,
              description: '',
              slug: name,
              url: '',
            } as Prismeai.Widget & { slug: string })
        ),
      },
      ...widgets,
    ].flatMap(({ appName, slug, widgets }) => {
      if (!widgets || widgets.length === 0) return [];
      const searchIn = `${appName} ${slug} ${widgets.map(
        ({ name, description, slug }) =>
          `${slug} ${localize(name)} ${localize(description)}`
      )}`.toLowerCase();
      if (!searchIn.match(search.toLowerCase())) return [];
      return {
        appName,
        slug,
        widgets: widgets.filter(({ name, description, slug }) =>
          `${localize(name)} ${localize(description)} ${slug}`
            .toLowerCase()
            .match(search.toLowerCase())
        ),
      };
    });
  }, [localize, search, widgets]);

  const isEmpty =
    !widgets ||
    !widgets.reduce<boolean>(
      (prev, { widgets = [] }) => prev || widgets.length > 0,
      false
    );

  if (isEmpty) {
    return (
      <div className="flex grow h-full flex-col overflow-auto">
        <Link href={`/workspaces/${workspaceId}`}>
          <a className="flex flex-1 justify-center items-center flex-col">
            <IconApps height={100} width={100} className="text-gray-200" />
            <div className="mt-4 text-gray text-center">
              {t('pages.widgets.empty')}
            </div>
          </a>
        </Link>
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
        {filteredWidgets.map(({ appName, slug: appSlug, widgets }) => (
          <Space key={appName} direction="vertical" className="!flex flex-1">
            {
              <Space>
                <Title level={4}>
                  {appSlug ? `${appSlug} (${appName})` : appName || 'Workspace'}
                </Title>
              </Space>
            }
            <Space direction="vertical" className="!flex flex-1">
              {widgets.map(({ slug, name, description = '' }) => (
                <Button
                  key={`${appSlug}.${slug}`}
                  onClick={() =>
                    onSubmit(appSlug ? `${appSlug}.${slug}` : slug)
                  }
                  className="w-full text-left !h-fit"
                >
                  <ListItem
                    title={localize(name) || slug}
                    content={
                      description
                        ? localize(description)
                        : t('pages.blocks.description', {
                            context: localize(name).toLowerCase(),
                          })
                    }
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
