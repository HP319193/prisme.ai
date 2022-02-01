import { addCustomAnnotations } from './aceEditorTweaks';

it('should add custom annotations to ACE editor', () => {
  const originalSetAnnotations = jest.fn();
  const annotations = [
    {
      row: 0,
      column: 0,
      text: 'http://',
      type: 'endpoint',
    },
  ];
  const editor = {
    session: {
      $annotations: annotations,
    },
    renderer: {
      $gutterLayer: {
        setAnnotations: originalSetAnnotations,
        $annotations: [
          {
            row: 0,
          },
        ],
      },
    },
  };

  addCustomAnnotations(editor, annotations);

  expect(editor.renderer.$gutterLayer.setAnnotations).not.toBe(
    originalSetAnnotations
  );

  expect(originalSetAnnotations).toHaveBeenCalled();

  expect(editor.renderer.$gutterLayer.$annotations).toEqual([
    { row: 0, className: 'ace_endpoint' },
  ]);
});
