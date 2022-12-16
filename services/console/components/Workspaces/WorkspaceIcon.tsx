import Image from 'next/image';
import { useState } from 'react';
import icon from '../../icons/icon-workspace.svg';
import { Workspace } from '../../utils/api';

interface WorkspaceIconProps extends Pick<Workspace, 'photo' | 'name'> {
  size?: number;
}
export const WorkspaceIcon = ({
  photo,
  name,
  size = 48,
}: WorkspaceIconProps) => {
  const [fallback, setFallback] = useState(!photo);

  return fallback ? (
    <Image
      src={icon}
      width={size}
      height={size}
      className="rounded"
      alt={name}
    />
  ) : (
    <div className="flex items-center justify-center flex-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        className="rounded object-cover"
        alt={name}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        onError={() => setFallback(true)}
      />
    </div>
  );
};

export default WorkspaceIcon;
