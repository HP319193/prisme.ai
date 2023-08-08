import { render } from 'react-dom';

function fallback(text: string) {
  console.log(text);

  const d = document.createElement('dialog');
  d.classList.add('copy-fallback');
  render(
    <div>
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
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(d);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function copy(text: string) {
  try {
    window.navigator.clipboard.writeText(text);
  } catch (e) {
    fallback(text);
  }
}

export default copy;
