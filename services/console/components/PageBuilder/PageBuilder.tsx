import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import Panel from '../Panel';
import { context, PageBuilderContext } from './context';
import WidgetForm from './Panel/WidgetForm';
import Widgets from './Widgets';
import { nanoid } from 'nanoid';

interface PageBuilderProps {
  value: PageBuilderContext['page'];
  onChange: (value: Prismeai.Page) => void;
}
export const PageBuilder = ({ value, onChange }: PageBuilderProps) => {
  const { workspace } = useWorkspace();
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

  const widgets = useMemo(() => workspace.widgets, [workspace.widgets]);

  useEffect(() => {
    (value.widgets || []).forEach((widget: { key?: string }) => {
      if (widget.key) return;
      widget.key = nanoid();
    });
  }, [value]);

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
  const addWidget = useCallback(
    async (position: number) => {
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

  return (
    <context.Provider value={{ page: value, widgets, addWidget }}>
      <Widgets />
      <Panel visible={panelIsOpen} onVisibleChange={hidePanel}>
        {widgetEditing && <WidgetForm {...widgetEditing} />}
      </Panel>
    </context.Provider>
  );
};

export default PageBuilder;
