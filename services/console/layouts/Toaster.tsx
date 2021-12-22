import { createContext, FC, useContext, useRef } from "react";
import { Toast } from "primereact/toast";

export const context = createContext<Toast>({} as Toast);

export const useToaster = () => useContext(context);

export const Toaster: FC = ({ children }) => {
  const ref = useRef(null);

  return (
    <context.Provider value={ref.current!}>
      {children}
      <Toast ref={ref} position="bottom-right" />
    </context.Provider>
  );
};

export default Toaster;
