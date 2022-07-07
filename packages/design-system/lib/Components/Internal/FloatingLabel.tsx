import { ReactNode } from 'react';

interface FloatingLabelProps {
  component: ReactNode;
  label?: string;
  raisedPlaceholder: boolean;
  className?: string;
}

const FloatingLabel = ({
  className,
  component,
  label,
  raisedPlaceholder,
}: FloatingLabelProps) => {
  return (
    <div
      className={`relative flex flex-1 pr-input ${
        label ? 'mt-5' : ''
      }  ${className}`}
    >
      {component}
      <label
        className={`duration-75 ease-in absolute bottom-[15px] origin-0 left-[11px] text-gray font-normal pointer-events-none ${
          raisedPlaceholder ? 'pr-label-top' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: label || '' }}
      />
    </div>
  );
};

export default FloatingLabel;
