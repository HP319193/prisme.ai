import { ReactElement } from "react";
import AutomationLayout from "./AutomationLayout";

export * from "./context";
export * from "./AutomationLayout";

export const getLayout = (page: ReactElement) => (
  <AutomationLayout>{page}</AutomationLayout>
);

export default getLayout;
