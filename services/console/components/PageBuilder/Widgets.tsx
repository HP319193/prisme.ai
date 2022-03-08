import { Title } from '@prisme.ai/design-system';
import { Fragment, useMemo } from 'react';
import useLocalizedText from '../../utils/useLocalizedText';
import AddWidget from './AddWidget';
import { usePageBuilder } from './context';
import Widget from './Widget';

export const Widgets = () => {
  const localize = useLocalizedText();
  const { page, widgets = [] } = usePageBuilder();
  const widgetsInPage = useMemo(() => {
    return (page.widgets || []).flatMap(({ key, name = '' }) => {
      const parts = name.split(/\./);
      parts.reverse();
      const [widgetName, appName = ''] = parts;
      const app = widgets.find(({ appSlug }) => appSlug === appName);
      console.log(app);
      if (!app) return [];
      const widget = app.widgets.find(({ slug }) => slug === widgetName);
      if (!widget) return [];
      return { ...widget, key, appName: app.appName };
    });
  }, [page.widgets, widgets]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="m-4">
        <AddWidget after={-1} />
      </div>
      {widgetsInPage.map(({ url, key, name, appName }, index) => (
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
          />
          <AddWidget after={index} />
        </Fragment>
      ))}
    </div>
  );
};
export default Widgets;
