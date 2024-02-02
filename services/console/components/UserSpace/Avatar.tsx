import Image from 'next/image';
import { useMemo } from 'react';
import { useUser } from '../UserProvider';
import hash from 'hash-sum';
import Color from 'color';

interface AvatarProps {
  size?: string;
}

export const AvatarPlaceholder = ({
  text,
  size,
}: { text: string } & AvatarProps) => {
  const color = useMemo(() => {
    return `#${hash(text).substring(0, 6)}`;
  }, [text]);
  const textColor = useMemo(() => {
    return Color(color).isLight() ? 'black' : 'white';
  }, [color]);
  return (
    <span
      className="flex justify-center items-center block text-white rounded-[100%]"
      role="img"
      style={{
        backgroundColor: color,
        color: textColor,
        height: size,
        width: size,
      }}
    >
      {text}
    </span>
  );
};

export const Avatar = ({ size = '2.4rem' }: AvatarProps) => {
  const { user } = useUser();
  const initials = useMemo(() => {
    if (!user) return;
    return user?.firstName?.charAt(0) + user?.lastName?.charAt(0);
  }, [user]);
  if (!user) return null;
  return user.photo ? (
    <Image
      src={user.photo}
      alt={initials}
      style={{
        height: size,
        width: size,
      }}
    />
  ) : (
    <AvatarPlaceholder text={initials} size={size} />
  );
};
export default Avatar;
