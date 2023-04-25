import { HTMLAttributes, ReactNode, useEffect } from 'react';
import { BlockComponent } from '../BlockLoader';
import { useBlock } from '../Provider';
import { useBlocks } from '../Provider/blocksContext';
import useLocalizedText from '../useLocalizedText';
import parser, { DOMNode, Element, domToReact } from 'html-react-parser';
import { marked } from 'marked';
import { BaseBlock } from './BaseBlock';
import { keysKebabToCamel } from '../utils/kebabToCamel';
import mustache from 'mustache';

interface RichTextConfig {
  content: string | Prismeai.LocalizedText;
  allowScripts?: boolean;
  values?: Record<string, ReactNode>;
  markdown?: boolean;
  container?: string;
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

function parseConfig(config: Record<string, any>): typeof config {
  return Object.entries(config).reduce((prev, [k, v]) => {
    let value = v;
    try {
      value = JSON.parse(v);
    } catch {}
    return {
      ...prev,
      [k]: value,
    };
  }, {});
}

export const RichText = ({
  children,
  allowScripts = false,
  className = '',
  values = {},
  markdown = true,
  container = 'div',
}: Omit<RichTextConfig, 'content'> & {
  children: RichTextConfig['content'];
} & HTMLAttributes<HTMLDivElement>) => {
  const { localize } = useLocalizedText();
  const {
    components: { Link },
    utils: { BlockLoader },
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
          const {
            style,
            ...attribs
          } = (domNode.attribs as unknown) as HTMLAnchorElement;
          return (
            <Link
              {...attribs}
              children={domToReact(domNode.children, options)}
            />
          );
        case 'pr-block':
          const { slug, ...config } = domNode.attribs;
          return (
            <BlockLoader
              name={slug}
              config={{
                ...parseConfig(keysKebabToCamel(config)),
                parentClassName: className,
              }}
            />
          );
        default:
          return domNode;
      }
    },
  };

  const text = localize(children) || '';
  const toRender = markdown ? marked(text) : text;
  const Container = container as keyof JSX.IntrinsicElements;
  const child = parser(mustache.render(toRender, values), options);

  if (!Container) return child;

  return (
    <Container className={`pr-block-rich-text ${className}`}>{child}</Container>
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
