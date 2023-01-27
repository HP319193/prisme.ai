// Cannot use css default module because css.stringify comes with
// require('fs') and breaks browser land
// @ts-ignore
import parse from 'css/lib/parse';
// @ts-ignore
import Identity from 'css/lib/stringify/identity';

export function prefixCSS(cssText: string, prefix: string) {
  function replaceSelectors(selectors: any) {
    return (selectors || []).map((sel: string) =>
      sel.match(/:block/) ? sel.replace(/:block/, prefix) : `${prefix} ${sel}`
    );
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

  try {
    const parsed = parse(cssText);
    parsed.stylesheet.rules = processRules(parsed.stylesheet?.rules || []);
    const compiler = new Identity();
    return compiler.compile(parsed);
  } catch (e) {
    console.error(e);
    return cssText;
  }
}

export default prefixCSS;
