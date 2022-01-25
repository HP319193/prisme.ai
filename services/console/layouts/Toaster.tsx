import {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Toast } from "primereact/toast";

export const context = createContext<Toast>({} as Toast);

export const useToaster = () => useContext(context);

export const Toaster: FC = ({ children }) => {
  const ref = useRef(null);
  const [toaster, setToaster] = useState<any>();
  useEffect(() => {
    // Force toaster to re-render with ref
    setToaster(ref.current);
  }, [ref]);
  return (
    <context.Provider value={toaster!}>
      {children}
      <Toast ref={ref} position="bottom-right" />
    </context.Provider>
  );
};

export default Toaster;
