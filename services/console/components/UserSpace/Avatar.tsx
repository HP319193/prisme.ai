import { useMemo } from 'react';
import { useUser } from '../UserProvider';
import Color from 'color';
import { stringToHexaColor } from '../../utils/strings';

interface AvatarProps {
  size?: string;
}

export const AvatarPlaceholder = ({
  text,
  size,
}: { text: string } & AvatarProps) => {
  const color = useMemo(() => {
    return `#${stringToHexaColor(text)}`;
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
    if (!user) return '';
    return (
      (user?.firstName || '')?.charAt(0) + (user?.lastName || '')?.charAt(0)
    );
  }, [user]);
  if (!user) return null;
  return user.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
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
