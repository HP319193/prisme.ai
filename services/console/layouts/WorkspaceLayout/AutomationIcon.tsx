import Color from 'color';
import AutomationIconSvg from '../../icons/automation.svgr';

interface AutomationIconProps {
  color: string;
  width?: number | string;
  height?: number | string;
}

export const AutomationIcon = ({
  color,
  width,
  height,
}: AutomationIconProps) => {
  const backgroundColor = new Color(color).fade(0.8).toString();
  return (
    <div
      className="flex p-[3px] rounded-[3px] justify-center"
      style={{ width, height, color, backgroundColor }}
    >
      <AutomationIconSvg />
    </div>
  );
};

export default AutomationIcon;
