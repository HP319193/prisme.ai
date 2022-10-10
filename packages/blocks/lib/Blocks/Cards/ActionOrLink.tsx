import { ReactElement } from 'react';
import { tw } from 'twind';
import { useBlocks } from '../../Provider/blocksContext';
import { useBlock } from '../../Provider';
import { Action } from './types';

interface ActionOrLinkProps {
  children: ReactElement;
  action?: Action;
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
          onClick={() => events?.emit(action.value, action.payload)}
          className={tw`cursor-pointer hover:text-theme-accent hover:border-theme-accent`}
        >
          {children}
        </div>
      );
    case 'url':
      return (
        <Link href={action.value}>
          <a
            className={tw`hover:text-theme-accent hover:border-theme-accent`}
            target={action.popup ? '_blank' : undefined}
          >
            {children}
          </a>
        </Link>
      );
    default:
      return children;
  }
};

export default ActionOrLink;
