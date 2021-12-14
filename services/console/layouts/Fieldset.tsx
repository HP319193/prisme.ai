import { Fieldset, FieldsetProps } from "primereact/fieldset";
import { FC } from "react";

export const FieldsetCustom: FC<FieldsetProps> = (props) => (
  <Fieldset className="pt-5" {...props} />
);

export default FieldsetCustom;
