import { FileFilled } from '@ant-design/icons';
import Color from 'color';

interface PageIconProps {
  color: string;
  width?: number | string;
  height?: number | string;
}

export const PageIcon = ({ color, width, height }: PageIconProps) => {
  const backgroundColor = new Color(color).fade(0.8).toString();
  return (
    <div
      className="flex p-[3px] rounded-[3px] justify-center"
      style={{ width, height, color, backgroundColor }}
    >
      <FileFilled />
    </div>
  );
};

export default PageIcon;
