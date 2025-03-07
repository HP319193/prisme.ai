import { ReactElement } from 'react';
//@ts-ignore
import { tw } from 'twind';
import { useBlocks } from '../Provider/blocksContext';
import { useBlock } from '../Provider';

interface ActionOrLinkProps {
  children: ReactElement;
  action?: Action;
}

export interface Action {
  type: 'event' | 'url';
  value: string;
  popup?: boolean;
  payload?: any;
}

const ActionOrLink = ({ action, children }: ActionOrLinkProps) => {
  const {
    components: { Link },
  } = useBlocks();
  const { events } = useBlock();

  if (!action || !action.value) return children;

  switch (action.type) {
    case 'event':
      return (
        <div
          onClick={() => {
            const urlSearchParams = new URLSearchParams(window.location.search);
            const query = Object.fromEntries(urlSearchParams.entries());

            events?.emit(action.value, {
              ...(Object.keys(query).length > 0 ? { query } : {}),
              ...action.payload,
            });
          }}
          className={tw`cursor-pointer hover:text-theme-accent hover:border-theme-accent`}
        >
          {children}
        </div>
      );
    case 'url':
      return (
        <Link href={action.value} target={action.popup ? '_blank' : undefined}>
          <div
            className={tw`hover:text-theme-accent hover:border-theme-accent`}
          >
            {children}
          </div>
        </Link>
      );
    default:
      return children;
  }
};

export default ActionOrLink;
