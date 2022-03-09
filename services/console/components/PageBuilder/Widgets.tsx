import { Fragment, useMemo } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import useLocalizedText from '../../utils/useLocalizedText';
import AddWidget from './AddWidget';
import { usePageBuilder } from './context';
import Widget from './Widget';

export const Widgets = () => {
  const localize = useLocalizedText();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const { page, widgets = [] } = usePageBuilder();
  const widgetsInPage = useMemo(() => {
    return (page.widgets || []).flatMap(({ key, name = '' }) => {
      const parts = name.split(/\./);
      parts.reverse();
      const [widgetName, appName = ''] = parts;
      const app = widgets.find(({ slug }) => slug === appName);
      if (!app) return [];
      const widget = app.widgets.find(({ slug }) => slug === widgetName);
      if (!widget) return [];
      return { ...widget, key, appName: app.appName, appInstance: app.slug };
    });
  }, [page.widgets, widgets]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="m-4">
        <AddWidget after={-1} />
      </div>
      {widgetsInPage.map(({ url, key, name, appName, appInstance }, index) => (
        <Fragment key={key}>
          <Widget
            url={url}
            id={`${key || index}`}
            title={
              <div className="flex flex-row">
                <strong className="mr-2">{localize(appName)}</strong>{' '}
                {localize(name)}
              </div>
            }
            workspaceId={workspaceId}
            appInstance={appInstance}
          />
          <AddWidget after={index} />
        </Fragment>
      ))}
    </div>
  );
};
export default Widgets;
