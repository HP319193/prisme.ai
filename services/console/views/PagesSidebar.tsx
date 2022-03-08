import {
  Button,
  ListItem,
  SearchInput,
  Space,
  Title,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useWorkspaces } from '../components/WorkspacesProvider';
import IconPages from '../icons/icon-pages.svgr';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import useLocalizedText from '../utils/useLocalizedText';

const emptyObject: Prismeai.Workspace['pages'] = {};

export const PagesSidebar = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('workspaces');
  const localize = useLocalizedText();
  const { createPage } = useWorkspaces();
  const { push } = useRouter();
  const {
    workspace,
    workspace: { id: workspaceId, pages = emptyObject },
  } = useWorkspace();

  const [filter, setFilter] = useState('');

  const filteredPages = useMemo(() => {
    return Object.keys(pages).flatMap((key) => {
      const { name, description = '' } = pages[key];
      return `${localize(name)} ${localize(description)}`
        .toLowerCase()
        .match(filter.toLowerCase())
        ? { ...pages[key], slug: key }
        : [];
    });
  }, [filter, localize, pages]);

  const [creating, setCreating] = useState(false);
  const generatePageName = useCallback(() => {
    const defaultName = t('pages.create.defaultName');
    let version = 0;
    const generateName = () =>
      `${defaultName}${version ? ` (${version})` : ''}`;
    const names = Object.keys(pages).map((key) => {
      const name = pages[key].name;
      return typeof name === 'string' ? name : name[language];
    });
    while (names.find((name) => name === generateName())) {
      version++;
    }
    return generateName();
  }, [language, pages, t]);

  const create = useCallback(async () => {
    setCreating(true);

    const name = generatePageName();
    try {
      const createdPage = await createPage(workspace, {
        name: {
          [language]: name,
        },
        widgets: [],
      });

      if (createdPage) {
        await push(`/workspaces/${workspaceId}/pages/${createdPage.id}`);
      }
    } catch (e) {}
    setCreating(false);
  }, [generatePageName, createPage, workspace, language, push, workspaceId]);

  const isEmpty = Object.keys(pages).length === 0;

  return (
    <div className="flex grow h-full flex-col">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="mb-0">
          {t('pages.link')}
        </Title>
        <Button onClick={create} disabled={creating}>
          {t('pages.create.label')}
        </Button>
      </div>
      {isEmpty && (
        <Button className="flex flex-1" onClick={create} disabled={creating}>
          <div className="flex flex-1 justify-center items-center flex-col">
            <IconPages width={100} height={100} className="text-gray-200" />
            <div className="mt-4 text-gray">{t('pages.create.label')}</div>
          </div>
        </Button>
      )}
      {!isEmpty && (
        <>
          <SearchInput
            placeholder={t('search')}
            className="mb-6"
            onChange={({ target: { value } }) => setFilter(value)}
          />
          <Space direction="vertical" className="flex grow overflow-x-auto">
            {filteredPages.map(({ name, description, slug }) => (
              <Link
                key={slug}
                href={`/workspaces/${workspaceId}/pages/${slug}`}
              >
                <a>
                  <ListItem
                    title={localize(name)}
                    content={localize(description)}
                  />
                </a>
              </Link>
            ))}
          </Space>
        </>
      )}
    </div>
  );
};

export default PagesSidebar;
