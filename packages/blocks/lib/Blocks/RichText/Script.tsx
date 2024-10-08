import { ReactNode, useEffect, useRef } from 'react';
import { useBlocks } from '../../Provider/blocksContext';
import getGlobals from '../whitelistedGlobals';
import Compartment from './Compartment';
import { StaticModuleRecord } from '@endo/static-module-record';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pr-script': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export class ScriptLoader {
  static externalModules: Map<string, string> = new Map();
  private modules: Record<string, any> = {};

  setModules(modules: Record<string, Function>) {
    this.modules = modules;
  }
  async execute(script: string) {
    const globals = getGlobals(window, this.modules);

    const imports = script.match(/^\s*import.*[;\n]/gm);
    const modulesMaps: Record<string, string> = {};
    if (imports) {
      await Promise.all(
        imports.map(async (line, index) => {
          const [, url] = line.match(/^import\s.*["'](.+?)["'][;\n]/) || [];
          if (!url) return;
          if (ScriptLoader.externalModules.get(url) === undefined) {
            try {
              const res = await fetch(url);
              ScriptLoader.externalModules.set(url, await res.text());
            } catch (e) {}
          }

          modulesMaps[url] = ScriptLoader.externalModules.get(url) || '';
        })
      );
    }
    modulesMaps['main.js'] = script;

    const sandbox = new Compartment(
      globals,
      {},
      {
        resolveHook: (moduleSpecifier, _moduleReferrer) => {
          return moduleSpecifier;
        },
        importHook: (moduleSpecifier) => {
          return Promise.resolve(
            new StaticModuleRecord(
              modulesMaps[moduleSpecifier],
              moduleSpecifier
            )
          );
        },
      }
    );
    try {
      sandbox.import('main.js');
    } catch (e) {
      console.groupCollapsed('Error in script execution.');
      console.log(
        '%cSome globals functions and variables are forbidden for security reasons. If you think one should be whitelisted, contact us.',
        'color: orange'
      );
      console.groupCollapsed('Original script');
      console.log(script);
      console.groupEnd();
      console.error(e);
      console.groupEnd();
    }
  }
}

export const Script = ({
  children,
  ...props
}: Omit<HTMLScriptElement, 'children'> & { children: ReactNode }) => {
  const elRef = useRef<any>(null);
  const {
    utils: { fetchWorkspaceOnly },
  } = useBlocks();
  const scriptLoader = useRef(new ScriptLoader());
  useEffect(() => {
    const script = typeof children === 'string' ? children : '';
    if (!script && !props.src) return;
    scriptLoader.current.setModules({
      element: elRef.current,
      container: elRef.current.parentNode,
      fetch: fetchWorkspaceOnly,
    });
    scriptLoader.current.execute(script);
  }, []);

  return <pr-script ref={elRef} />;
};

export default Script;
