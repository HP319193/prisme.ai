import Markdown from 'markdown-to-jsx';
import { HTMLAttributes, useEffect, useMemo } from 'react';
import { BlockComponent } from '../BlockLoader';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';

interface RichTextConfig {
  content: string | Prismeai.LocalizedText;
  allowScripts?: boolean;
}

class ScriptsLoader {
  private queue: HTMLScriptElement[] = [];
  private locked = false;

  private nextInQueue() {
    if (this.locked) return;

    const [next] = this.queue.splice(0, 1);
    if (!next) return;
    this.locked = true;
    let done = false;
    const loadNext = () => {
      if (done) return;
      done = true;
      this.locked = false;
      this.nextInQueue();
    };
    next.addEventListener('load', loadNext);
    document.body.appendChild(next);
    setTimeout(loadNext, 1000);
  }

  add(s: HTMLScriptElement) {
    this.queue.push(s);
    this.nextInQueue();
  }
}
const scriptsLoader = new ScriptsLoader();
const Script = ({ children, ...props }: HTMLScriptElement) => {
  useEffect(() => {
    const s = document.createElement('script');
    s.innerText = typeof children === 'string' ? children : '';
    Object.entries(props).forEach(([k, v]) => s.setAttribute(k, `${v}`));
    if (s.hasAttribute('async')) {
      document.body.appendChild(s);
      return;
    }
    scriptsLoader.add(s);
  }, []);

  return null;
};
const NoScript = () => {
  console.warn(
    'Your RichText Block contains HTML <script> tags but you did not allowed their execution by setting `allowScripts`.'
  );
  return null;
};

export const RichTextRenderer = ({
  children,
  allowScripts = false,
  ...props
}: Omit<RichTextConfig, 'content'> & {
  children: RichTextConfig['content'];
} & HTMLAttributes<HTMLDivElement>) => {
  const { localize } = useLocalizedText();
  const {
    components: { Link },
  } = useBlocks();

  const options = useMemo(
    () => ({
      overrides: {
        a: Link,
        script: allowScripts ? Script : NoScript,
      },
      forceBlock: true,
    }),
    [allowScripts]
  );

  if (!children) return null;

  return (
    <Markdown {...props} options={options}>
      {localize(children)}
    </Markdown>
  );
};

export const RichText: BlockComponent<RichTextConfig> = () => {
  const { config: { content = '', ...config } = {} } = useBlock<
    RichTextConfig
  >();

  return (
    <RichTextRenderer className="block-rich-text" {...config}>
      {content}
    </RichTextRenderer>
  );
};

RichText.Preview = ({
  config: { content = '', allowScripts, ...config } = {},
}) => {
  return <RichTextRenderer {...config}>{content}</RichTextRenderer>;
};

export default RichText;
