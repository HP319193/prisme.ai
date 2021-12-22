import { ReactElement, useCallback, useEffect, useState } from "react";
import { YAMLException } from "js-yaml";
import getAutomationLayout, {
  useAutomation,
} from "../layouts/AutomationLayout";
import getLayout from "../layouts/WorkspaceLayout";
import { Workspace } from "../api/types";
import dynamic from "next/dynamic";
import useYaml from "../utils/useYaml";
import { getLineNumber } from "../utils/yaml";

const CodeEditor = dynamic(import("../components/CodeEditor"), { ssr: false });
export const AutomationManifest = () => {
  const { automation, setAutomation, invalid } = useAutomation();
  const [value, setValue] = useState<string | undefined>();
  const [annotations, setAnnotations] = useState<any>();
  const { toJSON, toYaml } = useYaml();

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
          const row = getLineNumber(value, instancePath);
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

  if (value === undefined) return null;

  return (
    <div className="flex flex-1 flex-column">
      <CodeEditor
        mode="yaml"
        value={value}
        onChange={update}
        annotations={annotations}
      />
    </div>
  );
};

AutomationManifest.getLayout = (page: ReactElement) =>
  getLayout(getAutomationLayout(page));

export default AutomationManifest;
