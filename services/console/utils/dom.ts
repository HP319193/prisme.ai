export function selectText(element: HTMLElement) {
  const selection = window.getSelection()!;
  const range = document.createRange();

  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);

  return selection.toString();
}
