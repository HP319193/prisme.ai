import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { YAMLException } from "js-yaml";
import getAutomationLayout, {
  useAutomation,
} from "../layouts/AutomationLayout";
import getLayout, { useWorkspace } from "../layouts/WorkspaceLayout";
import { Workspace } from "../api/types";
import dynamic from "next/dynamic";
import useYaml from "../utils/useYaml";
import {
  findParameter,
  findParent,
  getLineNumberFromPath,
} from "../utils/yaml";
import { generateEndpoint } from "../utils/urls";
import { useToaster } from "../layouts/Toaster";
import { useTranslation } from "next-i18next";

const CodeEditor = dynamic(import("../components/CodeEditor"), { ssr: false });
export const AutomationManifest = () => {
  const { t } = useTranslation("workspaces");
  const { workspace } = useWorkspace();
  const { automation, setAutomation, invalid } = useAutomation();
  const [value, setValue] = useState<string | undefined>();
  const [annotations, setAnnotations] = useState<any>();
  const { toJSON, toYaml } = useYaml();
  const ref = useRef<HTMLDivElement>(null);
  const toaster = useToaster();

  const initYaml = useCallback(async () => {
    try {
      const value = await toYaml(automation.value);
      setValue(value);
    } catch (e) {}
  }, [automation.value, toYaml]);
  useEffect(() => {
    initYaml();
  }, [initYaml]);

  const checkSyntaxAndReturnYAML = useCallback(
    async (value: string) => {
      if (value === undefined) return;
      try {
        setAnnotations([]);
        return await toJSON<Workspace["automations"][0]>(value);
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
    [toJSON]
  );

  const update = useCallback(
    async (value: string) => {
      try {
        const json = await checkSyntaxAndReturnYAML(value);
        json && setAutomation(json);
      } catch (e) {}
    },
    [checkSyntaxAndReturnYAML, setAutomation]
  );

  useEffect(() => {
    if (!invalid || !value) {
      setAnnotations([]);
      return;
    }
    const annotations = invalid
      .map(({ instancePath, message }) => {
        try {
          const row = getLineNumberFromPath(value, instancePath);
          return {
            row,
            column: 0,
            text: message,
            type: "error",
          };
        } catch (e) {}
      })
      .filter(Boolean);
    setAnnotations(annotations);
  }, [invalid, value]);

  const allAnnotations = useMemo(() => {
    const endpoints = findParameter(`${value}`, {
      indent: 2,
      parameter: "endpoint",
    }).map(({ line, value: v }) => ({
      row: line - 1,
      column: 0,
      text: generateEndpoint(
        workspace.id,
        v === "true" ? (findParent(`${value}`, line) || { name: v }).name : v
      ),
      type: "endpoint",
    }));
    const allAnnotations = [...(annotations || []), ...endpoints];
    return allAnnotations;
  }, [annotations, value, workspace.id]);

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
  }, [allAnnotations, ref, toaster]);

  if (value === undefined) return null;

  return (
    <div className="flex flex-1 flex-column" ref={ref}>
      <CodeEditor
        mode="yaml"
        value={value}
        onChange={update}
        annotations={allAnnotations}
      />
    </div>
  );
};

AutomationManifest.getLayout = (page: ReactElement) =>
  getLayout(getAutomationLayout(page));

export default AutomationManifest;
