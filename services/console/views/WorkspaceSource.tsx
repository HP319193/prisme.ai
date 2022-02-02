import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { YAMLException } from "js-yaml";
import { useWorkspace } from "../layouts/WorkspaceLayout";
import { Workspace } from "../api/types";
import useYaml from "../utils/useYaml";
import {
  findParameter,
  findParent,
  getLineNumberFromPath,
  ValidationError,
} from "../utils/yaml";
import { generateEndpoint } from "../utils/urls";
import { useToaster } from "../layouts/Toaster";
import { useTranslation } from "next-i18next";
import { validateWorkspace } from "@prisme.ai/validation";
import CodeEditor from '../components/CodeEditor/lazy';

interface Annotation {
  row: number;
  column: number;
  text: string;
  type: "error";
}

const getEndpointAutomationName = (value: string, line: number) => {
  const { line: l = line } = findParent(`${value}`, line) || {}
  return findParent(`${value}`, l)
}

interface WorkspaceSourceProps {
  onLoad?: () => void;
}
export const WorkspaceSource: FC<WorkspaceSourceProps> = ({ onLoad }) => {
  const { t } = useTranslation("workspaces");
  const { workspace, setInvalid, setDirty, setNewSource, invalid, save } =
    useWorkspace();
  const [value, setValue] = useState<string | undefined>();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const { toJSON, toYaml } = useYaml();
  const ref = useRef<HTMLDivElement>(null);
  const toaster = useToaster();

  const initYaml = useCallback(async () => {
    try {
      const { id, ...json } = workspace
      const value = await toYaml(json);
      setValue(value);
    } catch (e) { }
  }, [workspace, toYaml]);
  useEffect(() => {
    initYaml();
  }, [initYaml]);

  const checkSyntaxAndReturnYAML = useCallback(
    async (value: string) => {
      if (value === undefined) return;
      try {
        setAnnotations([]);
        return { ...await toJSON<Workspace>(value), id: workspace.id };
      } catch (e) {
        const { mark, message } = e as YAMLException;
        setAnnotations([
          {
            row: mark.line,
            column: mark.position,
            text: message,
            type: "error",
          },
        ]);
      }
    },
    [toJSON, workspace.id]
  );

  const update = useCallback(
    async (newValue: string) => {
      try {
        const json = await checkSyntaxAndReturnYAML(newValue);

        if (!json) return;
        validateWorkspace(json);
        setInvalid((validateWorkspace.errors as ValidationError[]) || false);
        setNewSource(json);
        setDirty(true);
      } catch (e) {

      }
    },
    [checkSyntaxAndReturnYAML, setDirty, setInvalid, setNewSource]
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
            type: "error",
          };
        } catch (e) { }
      })
      .filter(Boolean) as Annotation[];
    setAnnotations(annotations);
  }, [invalid, value]);

  const allAnnotations = useMemo(() => {
    if (!workspace) return annotations;
    const endpoints = findParameter(`${value}`, {
      indent: 3,
      parameter: "endpoint",
    }).map(({ line, value: v }) => ({
      row: line - 1,
      column: 0,
      text: generateEndpoint(
        workspace.id,
        v === "true" ? (getEndpointAutomationName(`${value}`, line) || { name: v }).name : v
      ),
      type: "endpoint",
    }));
    const allAnnotations = [...(annotations || []), ...endpoints];
    return allAnnotations;
  }, [annotations, value, workspace]);

  useEffect(() => {
    const { current } = ref;
    if (!current) return;
    const listener = (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      if (!target.classList.contains("ace_endpoint")) return;
      const line = +(target.textContent || 0);
      const { text: url } =
        allAnnotations.find(
          ({ row, type }) => line - 1 === row && type === "endpoint"
        ) || {};
      if (!url) return;
      navigator.clipboard.writeText(url);
      toaster.show({
        severity: "info",
        summary: t("automations.endpoint.copied"),
      });
    };
    current.addEventListener("click", listener);

    return () => {
      current.removeEventListener("click", listener);
    };
  }, [allAnnotations, ref, t, toaster]);

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
    [save, t],
  );

  if (value === undefined) return null;

  return (
    <div className="flex flex-1 flex-column" ref={ref}>
      <CodeEditor
        mode="yaml"
        value={value}
        onChange={update}
        annotations={allAnnotations}
        onLoad={onLoad}
        shortcuts={shortcuts}
      />
    </div>
  );
};

export default WorkspaceSource;
