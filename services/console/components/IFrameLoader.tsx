import { useState } from 'react';
import { Loading } from '@prisme.ai/design-system';

const IFrameLoader = ({
  ...props
}: React.HTMLAttributes<HTMLIFrameElement> & {
  src: string;
  className?: string;
}) => {
  const [isReady, setIsReady] = useState(false);

  return (
    <div className="relative flex flex-1">
      {!isReady && (
        <div className="flex absolute top-0 bottom-0 left-0 right-0 justify-center items-center">
          <Loading />
        </div>
      )}
      <iframe onLoad={() => setIsReady(true)} {...props} />
    </div>
  );
};

export default IFrameLoader;
