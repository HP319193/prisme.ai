// Cannot use css default module because css.stringify comes with
// require('fs') and breaks browser land
// @ts-ignore
import parse from 'css/lib/parse';
// @ts-ignore
import Identity from 'css/lib/stringify/identity';

function removeComments(css: string) {
  return css.replace(/\/\*[^*]+\*\//g, '');
}
function extractImports(css: string): [string, string[]] {
  const imports = css.match(/@import url([^)]+["'])\);?/g);

  const cssWithoutImports = imports
    ? imports.reduce((prev, rule) => prev.replace(rule, ''), css)
    : css;
  return [cssWithoutImports, imports || []];
}

export function prefixCSS(
  cssText: string,
  {
    block,
    parent,
  }: {
    block: string;
    parent: string;
  }
) {
  function replaceSelectors(selectors: any) {
    return (selectors || []).map((sel: string) => {
      if (sel.match(/:block/) || sel.match(/:parent/) || sel.match(/:root/)) {
        return sel.replace(/:block/, block).replace(/:parent/, parent);
      }
      return `${block} ${sel}`;
    });
  }

  function processRules(rules: any) {
    return rules.map((rule: any) => {
      if (rule.type === 'media') {
        rule.rules = processRules(rule.rules);
        return rule;
      }
      if (rule.type === 'rule') {
        rule.selectors = replaceSelectors(rule.selectors);
      }
      return rule;
    });
  }

  const [css, imports] = extractImports(removeComments(cssText));

  try {
    const parsed = parse(css);
    parsed.stylesheet.rules = processRules(parsed.stylesheet?.rules || []);
    const compiler = new Identity();
    return `${imports.join('\n')}${compiler.compile(parsed)}`;
  } catch (e) {
    console.trace(new Error(`Failed to get prefix css on: ${cssText}`), e);
    return cssText;
  }
}

export default prefixCSS;
