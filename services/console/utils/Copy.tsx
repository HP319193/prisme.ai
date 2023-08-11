import { render } from 'react-dom';

function fallback(text: string) {
  console.log(text);

  const d = document.createElement('dialog');
  d.classList.add('copy-fallback');
  function selectAll() {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(d);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  render(
    <div className="p-4" onClick={selectAll}>
      <pre>
        <code>{text}</code>
      </pre>
    </div>,
    d
  );
  document.body.appendChild(d);
  d.addEventListener('mousedown', function (e) {
    e.stopPropagation();
    const rect = d.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      d.close();
    }
  });
  d.showModal();
  selectAll();
}

export function copy(text: string) {
  try {
    window.navigator.clipboard.writeText(text);
  } catch (e) {
    fallback(text);
  }
}

export default copy;
