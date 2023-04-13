import { ReactNode, useState } from 'react';
import { BlockContext, useBlock } from '../../Provider';
import {
  BlocksDependenciesContext,
  useBlocks,
} from '../../Provider/blocksContext';
import { ActionConfig, Action } from '../Action';
import { BaseBlock } from '../BaseBlock';
import { BlocksList, BlocksListConfig } from '../BlocksList';
import { BaseBlockConfig } from '../types';

interface TabsViewConfig extends BaseBlockConfig {
  tabs: ({
    text: ReactNode;
    content: BlocksListConfig;
  } & ActionConfig)[];
}

interface TabsViewProps extends TabsViewConfig {
  events: BlockContext['events'];
  Link: BlocksDependenciesContext['components']['Link'];
}

function isAction(
  action: Partial<TabsViewConfig['tabs'][number]>
): action is Omit<ActionConfig, 'text'> {
  return !!(action.type && action.value);
}

export const TabsView = ({
  tabs = [],
  className,
  events,
  Link,
}: TabsViewProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  return (
    <div className={`pr-block-tabs-view ${className}`}>
      <div className="pr-block-tabs-view__tabs">
        {tabs.map(({ text, ...action }, k) => {
          const navigate = () => setCurrentTab(k);

          if (isAction(action)) {
            return (
              <Action
                text={text}
                {...action}
                events={events}
                Link={Link}
                onClick={navigate}
                className={`pr-block-tabs-view__tab ${
                  currentTab === k ? 'pr-block-tabs-view__tab--active' : ''
                }`}
              />
            );
          }
          return (
            <button
              type="button"
              onClick={navigate}
              className={`pr-block-tabs-view__tab ${
                currentTab === k ? 'pr-block-tabs-view__tab--active' : ''
              }`}
            >
              {text}
            </button>
          );
        })}
      </div>
      <div className="pr-block-tabs-view__content">
        {tabs.map((tab, index) => (
          <BlocksList
            {...tabs[currentTab].content}
            className={`${tab.content.className || ''}${
              index === currentTab ? '' : 'hidden'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const defaultStyles = `:block {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.pr-block-tabs-view__tabs {
  display: flex;
  flex-direction: row;
}

.pr-block-tabs-view__tab {
  display: flex;
  padding: .5rem 1rem;
  margin: .5rem;
  border-radius: .5rem;
  border: 1px solid var(--accent-color);
}
.pr-block-tabs-view__tab--active {
  background: var(--accent-color);
  color: var(--accent-contrast-color);
}`;

export const TabsViewInContext = () => {
  const { config, events } = useBlock<TabsViewConfig>();
  const {
    components: { Link },
  } = useBlocks();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <TabsView {...config} events={events} Link={Link} />
    </BaseBlock>
  );
};

TabsViewInContext.styles = defaultStyles;

export default TabsViewInContext;
