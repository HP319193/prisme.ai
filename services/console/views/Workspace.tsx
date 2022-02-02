import { useEffect, useState } from 'react';
import { EventsViewer } from '../components/EventsViewer';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import WorkspaceSource from './WorkspaceSource';

export const Workspace = () => {
  const { displaySource } = useWorkspace();
  const [mountSourceComponent, setMountComponent] = useState(false);
  const [displaySourceView, setDisplaySourceView] = useState(false);

  useEffect(() => {
    if (displaySource) {
      setMountComponent(true);
    } else {
      setDisplaySourceView(false);
      setTimeout(() => setMountComponent(false), 200);
    }
  }, [displaySource]);

  return (
    <>
      <div
        className={`
          absolute top-0 bottom-0 right-0 left-0
          flex flex-1
          shadow-4
          transition-transform
          transition-duration-200
          transition-ease-in
          z-1
          ${displaySourceView ? '' : '-translate-y-100'}
        `}
      >
        {mountSourceComponent && (
          <WorkspaceSource onLoad={() => setDisplaySourceView(true)} />
        )}
      </div>
      <EventsViewer />
    </>
  );
};

Workspace.getLayout = getLayout;

export default Workspace;
