import { FC, ReactNode, useMemo } from "react";
import {
  FieldInputProps,
  FieldMetaState,
  FieldProps as FProps,
  useField,
} from "react-final-form";
import { classNames } from "primereact/utils";
import { isFormFieldValid } from "../utils/forms";

interface FieldProps extends Partial<FProps<any, any>> {
  label?: string | ReactNode;
  className?: string;
  children:
    | ReactNode
    | ((props: {
        className: string;
        input: FieldInputProps<any, HTMLElement>;
        meta: FieldMetaState<any>;
      }) => ReactNode);
}
export const FieldContainer: FC<FieldProps> = ({
  label,
  className,
  children,
  name = "",
  ...fieldProps
}) => {
  const { input, meta } = useField(name, fieldProps);
  const childrenClassName =
    classNames({
      "p-invalid": isFormFieldValid(meta),
    }) || "";
  return (
    <div className="p-field mb-5">
      <span className={`p-float-label mx-2 ${className}`}>
        {typeof children === "function"
          ? children({ input, meta, className: childrenClassName })
          : children}
        <label htmlFor={name}>{label}</label>
      </span>
    </div>
  );
};

export default FieldContainer;
