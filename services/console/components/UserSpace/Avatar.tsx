import Image from 'next/image';
import { useMemo } from 'react';
import { useUser } from '../UserProvider';
import hash from 'hash-sum';
import Color from 'color';

export const AvatarPlaceholder = ({ text }: { text: string }) => {
  const color = useMemo(() => {
    return `#${hash(text).substring(0, 6)}`;
  }, [text]);
  const textColor = useMemo(() => {
    return Color(color).isLight() ? 'black' : 'white';
  }, [color]);
  return (
    <span
      className="flex justify-center items-center w-[2.4rem] h-[2.4rem] block text-white rounded-[100%]"
      role="img"
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
      {text}
    </span>
  );
};

export const Avatar = () => {
  const { user } = useUser();
  const initials = useMemo(() => {
    return user?.firstName?.charAt(0) + user?.lastName?.charAt(0);
  }, [user.firstName, user.lastName]);

  return user.photo ? (
    <Image src={user.photo} alt={initials} />
  ) : (
    <AvatarPlaceholder text={initials} />
  );
};
export default Avatar;
