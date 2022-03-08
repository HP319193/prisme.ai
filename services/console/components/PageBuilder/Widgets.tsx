import { Fragment, useMemo } from 'react';
import { useApps } from '../AppsProvider';
import AddWidget from './AddWidget';
import { usePageBuilder } from './context';
import Widget from './Widget';

export const Widgets = () => {
  const { page, widgets = {} } = usePageBuilder();

  const widgetsInPage = useMemo(
    () =>
      (page.widgets || []).flatMap(({ name, key, ...custom }) => {
        if (!name || !widgets[name]) return [];
        return {
          ...widgets[name],
          name,
          ...custom,
          key,
        };
      }),
    [page.widgets, widgets]
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="m-4">
        <AddWidget after={-1} />
      </div>
      {widgetsInPage.map(({ url, key, name }, index) => (
        <Fragment key={key}>
          <Widget url={url} id={`${key || index}`} name={name} />
          <AddWidget after={index} />
        </Fragment>
      ))}
    </div>
  );
};
export default Widgets;
