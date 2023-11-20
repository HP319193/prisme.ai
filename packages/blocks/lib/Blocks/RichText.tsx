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
import { Tooltip } from 'antd';

interface RichTextConfig {
  content: string | Prismeai.LocalizedText;
  allowScripts?: boolean;
  values?: Record<string, ReactNode>;
  markdown?: boolean;
  // @deprecated
  container?: string;
  tag?: string;
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
    script && (s.innerHTML = script);
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
    s.innerHTML = typeof children === 'string' ? children : '';
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
  // @deprecated
  container = 'div',
  tag = container,
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
              {...(domNode.attribs as unknown as HTMLScriptElement)}
              children={(domNode.children as any)[0]?.data}
            />
          );
        case 'a':
          const { style, ...attribs } =
            domNode.attribs as unknown as HTMLAnchorElement;
          return (
            <Link
              {...attribs}
              children={domToReact(domNode.children, options)}
            />
          );
        case 'pr-block':
          const { slug, key, ...config } = domNode.attribs;
          return (
            <BlockLoader
              key={key}
              name={slug}
              config={{
                ...parseConfig(keysKebabToCamel(config)),
                parentClassName: className,
              }}
            />
          );
        case 'pr-tooltip':
          return (
            <Tooltip
              {...domNode.attribs}
              children={domToReact(domNode.children, options)}
            />
          );
        default:
          // This fixes crashes when html is invalid and tags contains invalid
          // characters
          if (!domNode.name.match(/^[a-z\-]+$/)) {
            domNode.name = domNode.name.replace(/[^a-zA-Z0-9\-]/g, '');
          }
          return domNode;
      }
    },
  };

  const text = localize(children) || '';

  const toRender =
    markdown && typeof text === 'string'
      ? marked(text)
      : typeof text === 'object'
      ? text
      : `${text}`;

  const Container =
    typeof tag === 'string' ? (tag as keyof JSX.IntrinsicElements) : null;
  let child: string | JSX.Element | JSX.Element[] = '';
  try {
    child = parser(mustache.render(toRender, values), options);
  } catch {}

  if (!Container) return <>{child}</>;

  return (
    <Container className={`pr-block-rich-text ${className}`}>{child}</Container>
  );
};

export const RichTextInContext: BlockComponent<RichTextConfig> = () => {
  const { config: { content = '', ...config } = {} } =
    useBlock<RichTextConfig>();
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
