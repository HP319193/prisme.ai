import { Events } from '../console/utils/api';

declare module '*.svgr' {
  const content: SvgrComponent;
  export default content;
}

declare global {
  interface Window {
    Prisme: {
      ai: {
        api: typeof api;
        events?: Events;
        debug: {
          events: {
            state: boolean;
            toggle: () => void;
          };
          blocks: {
            state: boolean;
            setBlockUrl: (name: string, url: string) => void;
            reset: () => void;
          };
        };
      };
    };
  }
}
