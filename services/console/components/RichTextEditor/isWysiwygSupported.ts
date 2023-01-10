const SUPPORTED_BY_WYSIWYG = [
  'p',
  'strong',
  'em',
  'u',
  's',
  'sub',
  'sup',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'ul',
  'ol',
  'li',
  { tag: 'a', attrs: ['href', 'target="_blank"', 'src'] },
  { tag: 'img', attrs: ['src'] },
  {
    tag: 'iframe',
    attrs: ['src', 'class="ql-video"', 'frameborder', 'allowfullscreen'],
  },
];

export enum Mode {
  WYSIWYG = 'wysiwyg',
  HTML = 'html',
}

const ATTRIBUTE_REG_EXP = /([a-zA-Z\-]+)=(["'].*?["'])/;

export function isWysiwygSupported(html: string) {
  const matches: string[] = html.match(/<[^\/]+?\/?>/g) || [];

  return matches.reduce((prev, match) => {
    const [, tag = '', attrs] = match.match(/<([a-zA-Z\-]+)(.*?)\/?>/) || [];
    return (
      prev &&
      !!SUPPORTED_BY_WYSIWYG.find((supported) => {
        if (typeof supported === 'string') return supported === tag;
        if (supported.tag !== tag) return false;
        if (supported.attrs.length === 0) return true;
        const attributes: string[] =
          attrs.match(new RegExp(ATTRIBUTE_REG_EXP, 'g')) || [];
        return attributes.reduce((prev, attr) => {
          const [, attribute, value] = attr.match(ATTRIBUTE_REG_EXP) || [];
          const found = supported.attrs.find((supportedAttr) => {
            const [
              supportedAttribute = '',
              supportedValue,
            ] = supportedAttr.split(/=/);
            if (supportedAttribute !== attribute) return false;
            if (!supportedValue) return true;
            const values = value.split(/\s/);
            const supportedValues = supportedValue.split(/\s/);

            return values.reduce((prev, value) => {
              return (prev && !value) || supportedValues.includes(value);
            }, true);
          });
          return prev && !!found;
        }, true);
      })
    );
  }, true);
}
