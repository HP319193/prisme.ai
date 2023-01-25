import { HTMLAttributes, ReactNode, useEffect } from 'react';
import { BlockComponent } from '../BlockLoader';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';
import parser, { DOMNode, Element, domToReact } from 'html-react-parser';
import { marked } from 'marked';
import { BaseBlock } from './BaseBlock';

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

  addScript({
    src,
    script,
    ...attrs
  }: HTMLScriptElement & { script?: string }) {
    const s = document.createElement('script');
    script && (s.innerText = script);
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, `${v}`));
    if (s.hasAttribute('async')) {
      document.body.appendChild(s);
      return;
    }
    this.add(s);
  }
}
const scriptsLoader = new ScriptsLoader();
const Script = ({
  children,
  ...props
}: Omit<HTMLScriptElement, 'children'> & { children: ReactNode }) => {
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

function isElement(domNode: DOMNode): domNode is Element {
  return !!(domNode as Element).name;
}

export const RichText = ({
  children,
  allowScripts = false,
  className = '',
}: Omit<RichTextConfig, 'content'> & {
  children: RichTextConfig['content'];
} & HTMLAttributes<HTMLDivElement>) => {
  const { localize } = useLocalizedText();
  const {
    components: { Link },
  } = useBlocks();

  if (!children) return null;

  const options = {
    replace(domNode: DOMNode) {
      if (!isElement(domNode)) return domNode;
      switch (domNode.name) {
        case 'script':
          if (!allowScripts) return <NoScript />;

          return (
            <Script
              {...((domNode.attribs as unknown) as HTMLScriptElement)}
              children={domToReact(domNode.children, options)}
            />
          );
        case 'a':
          return (
            <Link
              {...((domNode.attribs as unknown) as HTMLAnchorElement)}
              children={domToReact(domNode.children, options)}
            />
          );
        default:
          return domNode;
      }
    },
  };

  return (
    <div className={`pr-block-rich-text ${className}`}>
      {parser(marked(localize(children)), options)}
    </div>
  );
};

export const RichTextInContext: BlockComponent<RichTextConfig> = () => {
  const { config: { content = '', ...config } = {} } = useBlock<
    RichTextConfig
  >();
  return (
    <BaseBlock>
      <RichText {...config}>{content}</RichText>
    </BaseBlock>
  );
};

RichTextInContext.Preview = ({
  config: { content = '', allowScripts, ...config } = {},
}) => {
  return <RichText {...config}>{content}</RichText>;
};

export default RichTextInContext;
