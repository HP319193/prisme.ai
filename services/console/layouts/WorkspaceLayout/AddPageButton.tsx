import { PlusCircleOutlined } from '@ant-design/icons';
import { Dropdown, Menu, MenuProps } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import { useWorkspace } from '../../providers/Workspace';
import { useWorkspaceLayout } from './context';

const TEMPLATES = [
  {
    slug: 'index',
  },
  {
    slug: '_401',
  },
  {
    slug: '_404',
  },
  {
    slug: '_doc',
    blocks: [
      {
        slug: 'RichText',
        content: {
          fr: `<h1>Mon App</h1>
<p class="description">Description de mon App</p><br />`,
          en: `<h1>My App</h1>
<p class="description">My App description</p><br />`,
        },
      },
      {
        slug: 'TabsView',
        tabs: [
          {
            text: {
              fr: 'Documentation',
              en: 'Documentation',
            },
            type: 'event',
            content: {
              blocks: [
                {
                  slug: 'RichText',
                  content: 'Documentation',
                },
              ],
            },
          },
          {
            text: {
              fr: 'Journal des changements',
              en: 'Changelog',
            },
            type: 'event',
            content: {
              blocks: [
                {
                  slug: 'RichText',
                  content: `<div class="section">
  <h2>1.0.0</h2>    
  <div class="text">Published on <date>
  Latest stable release.

* This
* That

</div>`,
                },
              ],
            },
          },
          {
            text: {
              fr: 'API',
              en: 'API',
            },
            type: 'event',
            content: {
              blocks: [
                {
                  slug: 'RichText',
                  content: 'API',
                },
              ],
            },
          },
        ],
      },
    ],
  },
];

export const AddPageButton = () => {
  const { t } = useTranslation('workspaces');
  const {
    workspace: { pages },
  } = useWorkspace();
  const { createPage } = useWorkspaceLayout();
  const addPage = useCallback(
    (template?: Prismeai.Page) => () => {
      if (!template) {
        return createPage();
      }
      return createPage({ ...template, public: true });
    },
    [createPage]
  );

  const items = useMemo(() => {
    const allPages = pages ? Object.keys(pages) : [];
    const items: MenuProps['items'] = [
      {
        key: '1',
        label: t('pages.create.label'),
        onClick: addPage(),
      },
    ];
    const templates: NonNullable<MenuProps['items']>[number] = {
      key: '2',
      type: 'group',
      label: t('pages.create.template.title'),
      children: [] as any,
    };
    TEMPLATES.forEach((template, k) => {
      if (allPages.includes(template.slug)) return;
      templates.children!.push({
        key: `2-${k}`,
        label: t(`pages.create.template.${template.slug}`),
        onClick: addPage(template),
      });
    });

    if (templates.children!.length) {
      items.push(templates);
    }

    return items;
  }, [addPage, pages, t]);

  return (
    <Dropdown
      overlay={
        <Menu onClick={(e) => e.domEvent.stopPropagation()} items={items} />
      }
      placement="bottomRight"
      arrow
    >
      <PlusCircleOutlined />
    </Dropdown>
  );
};
export default AddPageButton;
