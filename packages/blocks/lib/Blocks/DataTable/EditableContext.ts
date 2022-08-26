import { FormInstance } from 'antd';
import { createContext, useContext } from 'react';

export const editableContext = createContext<FormInstance<any> | null>(null);
export const useEditable = () => useContext(editableContext);

export default editableContext;
