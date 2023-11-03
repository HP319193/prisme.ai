import { TextArea } from '@prisme.ai/design-system';
import { FormEvent, ReactElement } from 'react';
import { render } from 'react-dom';

function fallback(child: ReactElement) {
  const d = document.createElement('dialog');
  d.classList.add('copy-fallback');

  render(child, d);
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
  return d;
}

function fallbackCopy(text: string) {
  console.log(text);
  function selectAll(d: Element) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(d);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  const d = fallback(
    <div className="p-4" onClick={() => selectAll(d)}>
      <pre>
        <code>
          {typeof text === 'string' ? text : JSON.stringify(text, null, '  ')}
        </code>
      </pre>
    </div>
  );
  selectAll(d);
}

export function copy(text: string) {
  try {
    window.navigator.clipboard.writeText(text);
  } catch (e) {
    fallbackCopy(text);
  }
}

function fallbackPaste(): Promise<string> {
  return new Promise((resolve) => {
    const d = fallback(
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
        }}
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          resolve(e.currentTarget.pasting.value);
          d.close();
        }}
      >
        <TextArea name="pasting" style={{ minWidth: '50vw' }} autoSize />
        <button type="submit">Paste</button>
      </form>
    );
  });
}

export async function paste() {
  try {
    return await window.navigator.clipboard.readText();
  } catch {
    return await fallbackPaste();
  }
}

export default copy;
