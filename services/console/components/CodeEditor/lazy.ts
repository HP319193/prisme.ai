import dynamic from "next/dynamic";

export const CodeEditor = dynamic(import("./"), { ssr: false });

export default CodeEditor
