import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { YAMLException } from 'js-yaml';
import { Workspace } from '@prisme.ai/sdk';
import useYaml from '../utils/useYaml';
import { getLineNumberFromPath, ValidationError } from '../utils/yaml';
import { useTranslation } from 'next-i18next';
import {
  validateWorkspace,
  validateWorkspaceSecurity,
} from '@prisme.ai/validation';
import CodeEditor from '../components/CodeEditor/lazy';
import { Button, Loading, PageHeader, Space } from '@prisme.ai/design-system';
import {
  DisplayedSourceType,
  useWorkspaceLayout,
} from '../layouts/WorkspaceLayout/context';
import { useWorkspace } from '../providers/Workspace';
import api from '../utils/api';

interface Annotation {
  row: number;
  column: number;
  text: string;
  type: 'error';
}

interface WorkspaceSourceProps {
  onLoad?: () => void;
  sourceDisplayed?: DisplayedSourceType;
}
export const WorkspaceSource: FC<WorkspaceSourceProps> = ({
  onLoad,
  sourceDisplayed,
}) => {
  const { t } = useTranslation('workspaces');
  const {
    workspace: {
      id,
      pages,
      automations,
      imports,
      createdAt,
      createdBy,
      updatedAt,
      blocks,
      ...workspace
    },
  } = useWorkspace();
  const { onSaveSource } = useWorkspaceLayout();
  const { setInvalid, setNewSource, invalid, saving, displaySource } =
    useWorkspaceLayout();
  const [value, setValue] = useState<string | undefined>();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const { toJSON, toYaml } = useYaml();
  const ref = useRef<HTMLDivElement>(null);

  const initYaml = useCallback(async () => {
    try {
      if (sourceDisplayed === DisplayedSourceType.Config) {
        const newValue = await toYaml(workspace);
        setValue(newValue);
      } else if (sourceDisplayed === DisplayedSourceType.Roles) {
        // Without this, api.getWorkspaceSecurity is fetched with every keystroke ...
        if (value?.length) {
          return;
        }
        const security = await api.getWorkspaceSecurity(id);
        const newValue = await toYaml(security);
        setValue(newValue);
      }
    } catch (e) {}
  }, [sourceDisplayed, toYaml, workspace, value?.length, id]);

  useEffect(() => {
    initYaml();
  }, [initYaml]);

  const checkSyntaxAndReturnYAML = useCallback(
    async (value: string) => {
      if (!workspace || value === undefined) return;
      try {
        setAnnotations((prev) => (prev.length === 0 ? prev : []));
        return { ...(await toJSON<Workspace>(value)), id };
      } catch (e) {
        const { mark, message } = e as YAMLException;
        setAnnotations([
          {
            row: mark.line,
            column: mark.position,
            text: message,
            type: 'error',
          },
        ]);
      }
    },
    [id, toJSON, workspace]
  );

  const update = useCallback(
    async (newValue: string) => {
      try {
        const json = await checkSyntaxAndReturnYAML(newValue);

        if (!json) return;
        const validate =
          sourceDisplayed === DisplayedSourceType.Config
            ? validateWorkspace
            : validateWorkspaceSecurity;
        validate(json);
        setInvalid((validate.errors as ValidationError[]) || false);
        setNewSource(json);
      } catch (e) {}
    },
    [checkSyntaxAndReturnYAML, setInvalid, setNewSource, sourceDisplayed]
  );

  useEffect(() => {
    if (!invalid || !value) {
      setAnnotations([]);
      return;
    }

    const annotations = invalid
      .map(({ instancePath, message }) => {
        try {
          const row = getLineNumberFromPath(value, instancePath) - 1;
          return {
            row,
            column: 0,
            text: message,
            type: 'error',
          };
        } catch (e) {}
      })
      .filter(Boolean) as Annotation[];
    setAnnotations(annotations);
  }, [invalid, value]);

  const save = useCallback(() => {
    onSaveSource();
  }, [onSaveSource]);

  const shortcuts = useMemo(
    () => [
      {
        name: t('expert.save.help'),
        exec: save,
        bindKey: {
          mac: 'cmd-s',
          win: 'ctrl-s',
        },
      },
    ],
    [save, t]
  );

  if (value === undefined) return null;

  return (
    <div className="flex flex-1 flex-col" ref={ref}>
      <PageHeader
        RightButtons={[
          <Button
            key="close"
            onClick={() => displaySource(DisplayedSourceType.None)}
          >
            Fermer
          </Button>,
          <Button
            onClick={save}
            disabled={saving}
            key="1"
            className="!flex flex-row"
            variant="primary"
          >
            <Space>
              {t('automations.save.label')}
              {saving && <Loading />}
            </Space>
          </Button>,
        ]}
      />
      <CodeEditor
        mode="yaml"
        value={value}
        annotations={annotations}
        onChange={update}
        onLoad={onLoad}
        shortcuts={shortcuts}
      />
    </div>
  );
};

export default WorkspaceSource;
