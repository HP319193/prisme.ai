import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import AceEditor, { IAceEditorProps, IMarker } from "react-ace";
import ReactAce from "react-ace/lib/ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/snippets/javascript";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/mode-json";

import { Ace } from "ace-builds";
import { addCustomAnnotations } from "../../utils/aceEditorTweaks";

export interface CodeEditorProps extends IAceEditorProps {
  mode: "javascript" | "css" | "html" | "yaml" | "json";
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: string;
  width?: string;
  readOnly?: boolean;
  completers?: Ace.Completer[];
  annotations?: Ace.Annotation[];
  markers?: IMarker[];
  shortcuts?: {
    name: string;
    bindKey: {
      mac: string;
      win: string;
    };
    exec: () => void;
  }[];
  scrollTo?: [number, number];
  enableAutocompletion?: boolean;
  maxLines?: number;
}

export const CodeEditor = forwardRef<AceEditor, CodeEditorProps>(
  function CodeEditor(
    {
      value: initialValue,
      onChange,
      placeholder = "",
      mode,
      height = "auto",
      width = "auto",
      readOnly = false,
      completers,
      shortcuts,
      annotations,
      markers,
      scrollTo,
      style,
      ...props
    }: CodeEditorProps,
    ref
  ) {
    const value = useRef(initialValue);
    const aceRef = useRef<ReactAce>(null);
    useImperativeHandle(ref, () => aceRef.current!, []);
    //const theme = `solarized_${darkMode ? "dark" : "light"}`;
    const theme = `xcode`;

    useEffect(() => {
      if (!aceRef.current) return;
      addCustomAnnotations(aceRef.current.editor, annotations);
    }, [annotations]);

    useEffect(() => {
      if (!aceRef.current) return;
      const { editor } = aceRef.current;

      (completers || []).forEach((completer) =>
        editor.completers.push(completer)
      );
      // This code automatically opens autocomplete menu when typing `.` character
      editor.commands.on("afterExec", (e) => {
        if (e.command.name === "insertstring" && /^[\w.]$/.test(`${e.args}`)) {
          if (!aceRef.current) return;
          aceRef.current.editor.execCommand("startAutocomplete");
        }
      });

      return () => {
        (completers || []).forEach((completer) => {
          const pos = editor.completers.indexOf(completer);
          if (pos === -1) return;
          editor.completers.splice(pos, 1);
        });
      };
    }, [completers]);

    useEffect(() => {
      if (!aceRef.current) return;
      const { editor } = aceRef.current;
      (shortcuts || []).forEach((command) => {
        editor.commands.addCommand(command);
      });
    }, [shortcuts]);

    useEffect(() => {
      if (!aceRef.current) return;
      const { editor } = aceRef.current;
      Object.keys(editor.getSession().getMarkers()).forEach((key) => {
        editor.getSession().removeMarker(+key);
      });
      (markers || []).forEach((marker) => {
        const { className, endCol, endRow, startCol, startRow, type } = marker;
        const Range = ace.require("ace/range").Range;
        editor
          .getSession()
          .addMarker(
            new Range(startRow, startCol, endRow, endCol),
            className,
            type
          );
      });
    }, [markers]);

    return (
      <AceEditor
        ref={aceRef}
        style={{
          display: "flex",
          flex: 1,
          ...style,
        }}
        mode={mode}
        theme={theme}
        onChange={(v: string) => {
          value.current = v;
          onChange && onChange(v);
        }}
        value={value.current}
        enableBasicAutocompletion={true}
        enableLiveAutocompletion={true}
        enableSnippets={true}
        readOnly={readOnly}
        tabSize={2}
        placeholder={placeholder}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        height={height}
        width={width}
        annotations={annotations}
        {...props}
      />
    );
  }
);

export default CodeEditor;
