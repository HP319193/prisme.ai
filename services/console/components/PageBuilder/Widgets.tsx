import { Fragment, useMemo } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import useLocalizedText from '../../utils/useLocalizedText';
import AddWidget from './AddWidget';
import { usePageBuilder } from './context';
import Widget from './Widget';
import * as BuiltinBlocks from '../Blocks';
import { Schema } from '@prisme.ai/design-system';

export const Widgets = () => {
  const { localize } = useLocalizedText();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { page, widgets = [] } = usePageBuilder();

  const widgetsInPage = useMemo(() => {
    return (page.widgets || []).flatMap(({ key, name = '' }) => {
      const parts = name.split(/\./);
      parts.reverse();
      const [widgetName, appName = ''] = parts;
      if (!appName && Object.keys(BuiltinBlocks).includes(widgetName)) {
        return {
          url: undefined,
          component: BuiltinBlocks[widgetName as keyof typeof BuiltinBlocks],
          name: widgetName,
          key,
          appName: '',
          appInstance: undefined,
          edit: undefined,
        };
      }
      const app = widgets.find(({ slug }) => slug === appName);
      if (!app) return [];
      const widget = app.widgets.find(({ slug }) => slug === widgetName);
      if (!widget) return [];
      return { ...widget, key, appName: app.appName, appInstance: app.slug };
    });
  }, [page.widgets, widgets]);

  return (
    <div className="flex flex-1 flex-col max-w-[100vw]">
      <div className="m-4">
        <AddWidget after={-1} />
      </div>
      {widgetsInPage.map(
        ({ url, component, key, name, appName, appInstance, edit }, index) => (
          <Fragment key={key}>
            <Widget
              url={url}
              component={component}
              id={`${key || index}`}
              title={
                <div className="flex flex-row">
                  <strong className="mr-2">{localize(appName)}</strong>{' '}
                  {localize(name)}
                </div>
              }
              workspaceId={workspaceId}
              appInstance={appInstance}
              editSchema={edit as Schema['properties']}
            />
            <AddWidget after={index} />
          </Fragment>
        )
      )}
    </div>
  );
};
export default Widgets;
