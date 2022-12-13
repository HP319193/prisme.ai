import { AppstoreOutlined } from '@ant-design/icons';
import { Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  HTMLAttributes,
} from 'react';
import { search } from '../../../utils/filterUtils';
import useLocalizedText from '../../../utils/useLocalizedText';

import { stringToHexaColor } from '../../../utils/strings';
import SearchInput from '../../../components/Navigation/SearchInput';
import Highlight from '../../../components/Highlight/Highlight';
import Item from '../../../components/Navigation/Item';
import ItemsGroup, {
  ItemsGroupProps,
} from '../../../components/Navigation/ItemsGroup';
import Avatar from '../../../icons/avatar.svgr';
import { Workspace } from '../../../utils/api';
import WorkspaceIcon from '../../../components/Workspaces/WorkspaceIcon';

interface NavigationProps extends HTMLAttributes<HTMLDivElement> {
  workspaces: Workspace[];
  onExpand?: () => void;
}

export const Navigation = ({
  workspaces,
  onExpand,
  ...props
}: NavigationProps) => {
  const { t } = useTranslation('user');
  const { localize } = useLocalizedText();
  const { asPath } = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const types = ['workspaces'] as const;
  const [opens, setOpens] = useState<Map<'workspaces', boolean>>(
    new Map(
      types.map((type) => {
        switch (type) {
          case 'workspaces':
          // Always open while there is only one section

          // return [
          //   type,
          //   workspaces.findIndex(
          //     ({ id }) => `/account/workspaces/${id}` === asPath
          //   ) > -1,
          // ];
          default:
            return [type, true];
        }
      })
    )
  );
  const toggles = useRef<Map<typeof types[number], ItemsGroupProps['onClick']>>(
    new Map()
  );
  const toggle = useCallback((id: typeof types[number]) => {
    if (!toggles.current.get(id)) {
      toggles.current.set(id, () =>
        setOpens((opens) => {
          const newOpens = new Map(opens);
          newOpens.set(id, !opens.get(id));
          return newOpens;
        })
      );
    }
    return toggles.current.get(id);
  }, []);

  const filteredWorkspaces = useMemo(
    () =>
      workspaces.filter(({ slug, name, description }) =>
        search(searchValue)(
          `${slug} ${localize(name)} ${localize(description)}}`
        )
      ),
    [workspaces, localize, searchValue]
  );

  useEffect(() => {
    const path = decodeURIComponent(asPath);
    const data: Record<typeof types[number], string[]> = {
      workspaces: workspaces.map(({ id }) => `/accounts/workspaces/${id}`),
    };
    setOpens((opens) => {
      const newOpens = new Map(opens);
      let changed = false;
      Object.entries(data).map(([type, hrefs]) => {
        if (hrefs.includes(path) && !opens.get(type as typeof types[number])) {
          newOpens.set(type as typeof types[number], true);
          changed = true;
        }
      });
      return changed ? newOpens : opens;
    });
  }, [asPath, workspaces, toggle]);

  return (
    <div className={`flex flex-col max-h-full ${props.className}`} {...props}>
      <SearchInput
        value={searchValue}
        onChange={setSearchValue}
        onFocus={onExpand}
      />
      <div
        role="navigation"
        className="flex flex-1 flex-col overflow-auto max-h-[calc(100%-3rem)]"
      >
        <div className="border-b-[1px]">
          <Item
            href="/account"
            icon={({ selected }) => (
              <Tooltip
                title={t('workspace.sections.activity')}
                placement="right"
              >
                <div className="mb-1">
                  <Avatar width={17} height={17} />
                </div>
              </Tooltip>
            )}
          >
            {t('account_my')}
          </Item>
        </div>
        {!(searchValue && filteredWorkspaces.length === 0) && (
          <ItemsGroup
            title={t('workspaces')}
            onClick={toggle('workspaces')}
            open={
              !!opens.get('workspaces') ||
              (!!searchValue && filteredWorkspaces.length > 0)
            }
            tooltip={t('workspace.add.page')}
          >
            {filteredWorkspaces.map(
              ({ id, slug, name, description, photo }) => (
                <Item
                  key={slug}
                  href={`/account/workspaces/${id}`}
                  icon={
                    <Tooltip title={name} placement="right">
                      <div>
                        <WorkspaceIcon photo={photo} name={name} size={20} />
                      </div>
                    </Tooltip>
                  }
                >
                  <div className="flex flex-1 flex-col max-w-full">
                    <div className="text-ellipsis overflow-hidden">
                      <Highlight
                        highlight={searchValue}
                        component={<span className="font-bold text-accent" />}
                      >
                        {localize(name)}
                      </Highlight>
                    </div>
                    <div className="text-ellipsis overflow-hidden text-xs text-gray">
                      <Highlight
                        highlight={searchValue}
                        component={<span className="font-bold text-accent" />}
                      >
                        {localize(description)}
                      </Highlight>
                    </div>
                  </div>
                </Item>
              )
            )}
          </ItemsGroup>
        )}
      </div>
    </div>
  );
};

export default Navigation;
