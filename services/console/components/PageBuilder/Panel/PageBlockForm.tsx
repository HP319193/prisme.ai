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
import * as BuiltinBlocks from '../../Blocks';

interface PageBlockFormProps {
  onSubmit: (blockSlug: string) => void;
}

export const PageBlockForm = ({ onSubmit }: PageBlockFormProps) => {
  const { blocks } = usePageBuilder();

  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const [search, setSearch] = useState('');
  const filteredBlocks = useMemo(() => {
    return [
      {
        appName: 'Built-In',
        slug: '',
        blocks: Object.keys(BuiltinBlocks).map(
          (name) =>
            ({
              name,
              description: '',
              slug: name,
              url: '',
            } as Prismeai.Block & { slug: string })
        ),
      },
      ...blocks,
    ].flatMap(({ appName, slug, blocks }) => {
      if (!blocks || blocks.length === 0) return [];
      const searchIn = `${appName} ${slug} ${blocks.map(
        ({ name, description, slug }) =>
          `${slug} ${localize(name)} ${localize(description)}`
      )}`.toLowerCase();
      if (!searchIn.match(search.toLowerCase())) return [];
      return {
        appName,
        slug,
        blocks: blocks.filter(({ name, description, slug }) =>
          `${localize(name)} ${localize(description)} ${slug}`
            .toLowerCase()
            .match(search.toLowerCase())
        ),
      };
    });
  }, [localize, search, blocks]);

  return (
    <div className="flex grow h-full flex-col overflow-auto">
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('pages.blocks.search')}
        className="mb-6"
      />
      <Space direction="vertical" className="flex grow overflow-x-auto">
        {filteredBlocks.map(({ appName, slug: appSlug, blocks }) => (
          <Space key={appName} direction="vertical" className="!flex flex-1">
            {
              <Space>
                <Title level={4}>
                  {appSlug ? `${appSlug} (${appName})` : appName || 'Workspace'}
                </Title>
              </Space>
            }
            <Space direction="vertical" className="!flex flex-1">
              {blocks.map(({ slug, name, description = '' }) => (
                <Button
                  key={`${appSlug}.${slug}`}
                  onClick={() =>
                    onSubmit(appSlug ? `${appSlug}.${slug}` : slug)
                  }
                  className="w-full text-left !h-fit"
                >
                  <ListItem
                    title={t('pages.blocks.name', {
                      context: localize(name) || slug,
                    })}
                    content={
                      description
                        ? localize(description)
                        : t('pages.blocks.description', {
                            context: localize(name),
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

export default PageBlockForm;
