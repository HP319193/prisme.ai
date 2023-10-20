import { isLocalizedObject } from '@prisme.ai/design-system';
import { ReactNode, useState } from 'react';
import { BlockContext, useBlock } from '../../Provider';
import { useBlocks } from '../../Provider/blocksContext';
import useLocalizedText from '../../useLocalizedText';
import { ActionConfig, Action } from '../Action';
import { BaseBlock } from '../BaseBlock';
import { BlocksListConfig } from '../BlocksList';
import { BaseBlockConfig } from '../types';

interface TabsViewConfig extends BaseBlockConfig {
  tabs: ({
    text: ReactNode | BlocksListConfig;
    selectedText?: ReactNode;
    content: BlocksListConfig;
  } & ActionConfig)[];
  direction: 'vertical' | 'horizontal';
}

interface TabsViewProps extends TabsViewConfig {
  events: BlockContext['events'];
}

function isAction(
  action: Partial<TabsViewConfig['tabs'][number]>
): action is Omit<ActionConfig, 'text'> {
  return !!(action.type && action.value);
}

function isBlocksList(
  text: TabsViewConfig['tabs'][number]['text']
): text is BlocksListConfig {
  return !!(text as BlocksListConfig).blocks;
}

export const TabsView = ({
  tabs = [],
  direction,
  className,
  events,
}: TabsViewProps) => {
  const { localize } = useLocalizedText();
  const [currentTab, setCurrentTab] = useState(0);
  const isHorizontal = direction !== 'vertical';
  const {
    components: { Link },
    utils: { BlockLoader },
  } = useBlocks();
  return (
    <div
      className={`pr-block-tabs-view ${
        isHorizontal ? 'flex-col' : 'flex-row'
      } ${className}`}
    >
      <div
        className={`pr-block-tabs-view__tabs ${
          isHorizontal ? 'flex-row' : 'flex-col'
        }`}
      >
        {tabs.map(({ text, selectedText, ...action }, k) => {
          const navigate = () => setCurrentTab(k);
          const currentText =
            currentTab === k && selectedText ? selectedText : text;

          if (isBlocksList(text)) {
            return (
              <button
                key={k}
                type="button"
                onClick={navigate}
                className={`pr-block-tabs-view__tab ${
                  currentTab === k ? 'pr-block-tabs-view__tab--active' : ''
                }`}
              >
                <BlockLoader name="BlocksList" config={text} />
              </button>
            );
          }
          if (isAction(action)) {
            return (
              <Action
                key={k}
                text={currentText}
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
              key={k}
              type="button"
              onClick={navigate}
              className={`pr-block-tabs-view__tab ${
                currentTab === k ? 'pr-block-tabs-view__tab--active' : ''
              }`}
            >
              {isLocalizedObject(currentText)
                ? localize(currentText)
                : currentText}
            </button>
          );
        })}
      </div>
      <div className="pr-block-tabs-view__content">
        {tabs.map((tab, index) => (
          <div
            className={
              index === currentTab ? '' : 'pr-block-tabs-view__content--hidden'
            }
          >
            <BlockLoader
              key={index}
              name="BlocksList"
              config={{
                ...tabs[index].content,
                className: `${tab.content?.className || ''}${
                  index === currentTab ? '' : 'hidden'
                }`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const defaultStyles = `:block {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.pr-block-tabs-view__tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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
}
.pr-block-tabs-view__content--hidden {
  display: none;
}`;

export const TabsViewInContext = () => {
  const { config, events } = useBlock<TabsViewConfig>();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <TabsView {...config} events={events} />
    </BaseBlock>
  );
};

TabsViewInContext.styles = defaultStyles;

export default TabsViewInContext;
