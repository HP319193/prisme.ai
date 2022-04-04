import { useCallback, useMemo, useState } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import Panel from '../Panel';
import { context, PageBuilderContext } from './context';
import WidgetForm from './Panel/WidgetForm';
import Widgets from './Widgets';
import { nanoid } from 'nanoid';
import { useApps } from '../AppsProvider';
import equal from 'fast-deep-equal';

interface PageBuilderProps {
  value: PageBuilderContext['page'];
  onChange: (value: Prismeai.Page) => void;
}
export const PageBuilder = ({ value, onChange }: PageBuilderProps) => {
  const { workspace } = useWorkspace();
  const { appInstances } = useApps();
  const [panelIsOpen, setPanelIsOpen] = useState(false);
  const [widgetEditing, setWidgetEditing] = useState<
    | {
        onSubmit: (v: string) => void;
      }
    | undefined
  >();
  const hidePanel = useCallback(() => {
    setWidgetEditing(undefined);
    setPanelIsOpen(false);
  }, []);

  const widgets: PageBuilderContext['widgets'] = useMemo(() => {
    return [
      {
        slug: '',
        appName: '',
        widgets: Object.keys(workspace.widgets || {}).map((slug) => ({
          slug,
          ...(workspace.widgets || {})[slug],
        })),
      },
      ...(appInstances.get(workspace.id) || []).map(
        ({ slug = '', appName = '', widgets = [] }) => ({
          slug,
          appName,
          widgets: widgets.map(
            ({ slug, description = slug, name = slug, url = '', edit }) => ({
              slug,
              name,
              description,
              url,
              edit,
            })
          ),
        })
      ),
    ];
  }, [appInstances, workspace.id, workspace.widgets]);

  // Generate keys
  (value.widgets || []).forEach((widget: { key?: string }) => {
    if (widget.key) return;
    widget.key = nanoid();
  });

  const addWidgetDetails = useCallback(async () => {
    return new Promise<string>((resolve) => {
      hidePanel();
      setWidgetEditing({
        onSubmit: (widgetSlug: string) => {
          resolve(widgetSlug);
          hidePanel();
        },
      });
      setPanelIsOpen(true);
    });
  }, [hidePanel]);
  const addWidget: PageBuilderContext['addWidget'] = useCallback(
    async (position) => {
      const widget = await addWidgetDetails();
      const newWidgets = [...value.widgets];
      newWidgets.splice(position, 0, { name: widget, key: nanoid() });
      onChange({
        ...value,
        widgets: newWidgets,
      });
    },
    [addWidgetDetails, onChange, value]
  );

  const removeWidget: PageBuilderContext['removeWidget'] = useCallback(
    (key) => {
      const newWidgets = value.widgets.filter(({ key: k }) => k !== key);
      onChange({
        ...value,
        widgets: newWidgets,
      });
    },
    [onChange, value]
  );

  const setWidgetConfig: PageBuilderContext['setWidgetConfig'] = useCallback(
    (key, config) => {
      const newWidgets = value.widgets.map((widget) =>
        key === widget.key
          ? {
              ...widget,
              config: {
                ...widget.config,
                ...config,
              },
            }
          : widget
      );
      if (equal(newWidgets, value.widgets)) return;
      onChange({
        ...value,
        widgets: newWidgets,
      });
    },
    [onChange, value]
  );

  return (
    <context.Provider
      value={{ page: value, widgets, addWidget, removeWidget, setWidgetConfig }}
    >
      <div className="relative flex flex-1 overflow-x-hidden">
        <Widgets />
        <Panel visible={panelIsOpen} onVisibleChange={hidePanel}>
          {widgetEditing && <WidgetForm {...widgetEditing} />}
        </Panel>
      </div>
    </context.Provider>
  );
};

export default PageBuilder;
