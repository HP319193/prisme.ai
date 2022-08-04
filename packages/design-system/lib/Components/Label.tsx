import { ReactNode } from 'react';

export interface LabelProps {
  label?: string;
  className?: string;
}

export interface WithLabelProps {
  children: ReactNode;
  label?: string;
  className?: string;
  overrideClassName?: string;
}

export const Label = ({ label, className = '' }: LabelProps) => (
  <label
    className={`flex mb-[0.625rem] ${className}`}
    dangerouslySetInnerHTML={{ __html: label || '' }}
  />
);

export const WithLabel = ({
  className = '',
  overrideClassName,
  children,
  label,
}: WithLabelProps) => {
  return (
    <div className={overrideClassName || `flex flex-1 flex-col ${className}`}>
      {label && (
        <label
          className={`flex mb-[0.625rem]`}
          dangerouslySetInnerHTML={{ __html: label || '' }}
        />
      )}
      {children}
    </div>
  );
};

export default Label;
