import { PlusCircleOutlined } from '@ant-design/icons';
import { Dropdown, Menu, MenuProps } from 'antd';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';
import { useWorkspace } from '../../providers/Workspace';
import { useWorkspaceLayout } from './context';

export const AddPageButton = () => {
  const { t } = useTranslation('workspaces');
  const {
    workspace: { pages },
  } = useWorkspace();
  const { createPage } = useWorkspaceLayout();
  const addPage = useCallback(
    (template?: string) => () => {
      if (!template) {
        return createPage();
      }
      return createPage({ slug: template, public: true });
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
    ['index', '_401', '_404'].forEach((template, k) => {
      if (allPages.includes(template)) return;
      templates.children!.push({
        key: `2-${k}`,
        label: t(`pages.create.template.${template}`),
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
