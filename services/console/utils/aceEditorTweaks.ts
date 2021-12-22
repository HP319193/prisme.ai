export const addCustomAnnotations = (editor: any) => {
  const original = editor.renderer.$gutterLayer.setAnnotations.bind(
    editor.renderer.$gutterLayer
  );
  editor.renderer.$gutterLayer.setAnnotations = function (annotations: any) {
    original(annotations);
    editor.renderer.$gutterLayer.$annotations.forEach(
      (annotation: any, index: number) => {
        const { type } =
          editor.session.$annotations.find(({ row }: any) => row === index) ||
          {};
        annotation.className = `ace_${type}`;
      }
    );
  };
};
