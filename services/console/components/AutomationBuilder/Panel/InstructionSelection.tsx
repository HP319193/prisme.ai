import { useTranslation } from "next-i18next";
import Image from "next/image";
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { FC, useMemo, useState } from "react"
import { useAutomationBuilder } from "../context";

export interface InstructionSelectionProps {
  onSubmit: (key: string) => void;
}

export const InstructionSelection: FC<InstructionSelectionProps> = ({ onSubmit }) => {
  const { t } = useTranslation('workspaces');
  const { instructionsSchemas } = useAutomationBuilder();
  const [search, setSearch] = useState('');
  const filteredInstructions = useMemo(() => {
    return instructionsSchemas.reduce<[string, string, string[]][]>((prev, [name, list, more]) => {
      const matching = search ? Object.keys(list).filter(a => a.match(search)) : Object.keys(list)
      if (!matching) return prev;
      return [
        ...prev,
        [name, more.icon, matching]
      ];
    }, []);
  }, [instructionsSchemas, search])

  return (
    <>
      <div className="flex flex-1 align-items-stretch flex-column mb-4">
        <div>{t('automations.edit.select')}</div>
        <span className="p-input-icon-left p-input-icon-right">
          <i className="pi pi-search" />
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('automations.instruction.search')}
            autoFocus
          />
          <i><button onClick={() => setSearch('')} style={{ background: 'none', border: 0, color: 'inherit' }}><i className="pi pi-times" /></button></i>
        </span>
      </div>
      {filteredInstructions.map(([section, icon, instructionsInSection]) => (
        <div key={section} className="flex flex-1 flex-column mb-4">
          <div className="flex align-items-center">
            <div className="mr-2">
              <Image src={icon} width={16} height={16} alt={section} />
            </div>
            {section}
          </div>
          {instructionsInSection.map(key => (
            <Button
              key={key}
              onClick={() => onSubmit(key)}
              className="p-button-outlined my-1"
            >{key}</Button>
          ))}
        </div>
      ))}
    </>
  )
}

export default InstructionSelection
