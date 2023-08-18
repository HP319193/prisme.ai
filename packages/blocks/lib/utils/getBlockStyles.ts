import prefixCSS from './prefixCSS';

export function getBlockStyles({
  css,
  defaultStyles,
  containerClassName,
  parentClassName,
}: {
  css: string;
  defaultStyles?: string;
  containerClassName: string;
  parentClassName: string;
}) {
  return prefixCSS(
    (typeof css === 'string' ? css : '').replace(
      /@import\s+default;/,
      defaultStyles || ''
    ),
    {
      block: `.${containerClassName}`,
      parent: `.${parentClassName}`,
    }
  );
}

export default getBlockStyles;
