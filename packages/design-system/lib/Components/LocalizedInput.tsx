import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { locales } from 'iso-lang-codes';
import Input, { InputProps } from './Input';
import {
  DeleteOutlined,
  GlobalOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import CustomSelect from './CustomSelect';

const allLangs = locales();
const availableLangs = Object.keys(allLangs).reduce((prev, next) => {
  const shortLang = next.substring(0, 2);
  const shortLocale = allLangs[next].replace(/(;| \().*\)?$/, '');
  prev.set(shortLang, shortLocale);
  return prev;
}, new Map());

type LocalizedTextObject = Record<string, string>;
const isLocalizedTextObject = (
  value: string | LocalizedTextObject
): value is LocalizedTextObject => typeof value !== 'string';

export interface LocalizedInputProps {
  value: LocalizedTextObject | string;
  onChange: (v: LocalizedTextObject | string) => void;
  Input?: string | any; //((props: Pick<InputProps, 'value' | 'onChange'>) => ReactElement);
  InputProps?: any;
  setLangsTitle?: string;
  availableLangsTitle?: string;
  setLangTooltip?: string;
  // String with {{lang}} placeholder to display current lang
  addLangTooltip?: string;
  deleteTooltip?: string;
  iconMarginTop?: number | string;
}

const DftInput = forwardRef((props: InputProps, ref: any) => (
  <Input ref={ref} containerClassName="flex flex-1" {...props} />
));

export const LocalizedInput = ({
  value,
  onChange,
  Input: Component = DftInput,
  InputProps = {},
  setLangsTitle = 'Set languages',
  availableLangsTitle = 'Available languages',
  setLangTooltip = 'choose language',
  addLangTooltip = 'Add {{lang}}',
  deleteTooltip = 'remove language',
  iconMarginTop = 0,
}: LocalizedInputProps) => {
  const [selectedLang, setSelectedLang] = useState(
    isLocalizedTextObject(value) ? Object.keys(value)[0] : ''
  );
  const input = useRef<any>(null);

  const setValue = useCallback(
    (text: string, selectedLang: string) => {
      if (!selectedLang) {
        onChange(text);
        return;
      }
      onChange({
        ...(isLocalizedTextObject(value) ? value : {}),
        [selectedLang]: text,
      });
    },
    [value]
  );

  const addLang = useCallback((lang: string) => {
    setSelectedLang(lang);
    if (typeof value === 'string') {
      setValue(value, lang);
    }
    input.current && input.current.focus && input.current.focus();
  }, []);

  const deleteLang = useCallback(
    (lang: string) => {
      if (!isLocalizedTextObject(value)) return;
      const newValue = Object.keys(value)
        .filter((k) => k !== lang)
        .reduce((prev, k) => ({ ...prev, [k]: value[k] }), {});
      onChange(Object.keys(newValue).length === 0 ? '' : newValue);
      setSelectedLang(Object.keys(newValue)[0] || '');
    },
    [value]
  );

  const langs = useMemo(() => {
    const unsetLanguages = new Map(availableLangs);
    isLocalizedTextObject(value) &&
      Object.keys(value).forEach((lang) => unsetLanguages.delete(lang));
    const setLangs = isLocalizedTextObject(value)
      ? [
          {
            label: setLangsTitle,
            options: Object.keys(value).map((key) => ({
              label: (
                <div className="flex flex-1 flex-row justify-between">
                  {availableLangs.get(key) || key}
                  <Tooltip title={deleteTooltip} placement="left">
                    <button
                      className="mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLang(key);
                      }}
                    >
                      <DeleteOutlined />
                    </button>
                  </Tooltip>
                </div>
              ),
              searchable: availableLangs.get(key) || key,
              value: key,
            })),
          },
        ]
      : [];
    if (selectedLang && setLangs[0]) {
      unsetLanguages.delete(selectedLang);
      if (!setLangs[0].options.find(({ value }) => selectedLang === value)) {
        setLangs[0].options.push({
          label: availableLangs.get(selectedLang),
          searchable: availableLangs.get(selectedLang),
          value: selectedLang,
        });
      }
    }

    return [
      ...setLangs,
      {
        label: availableLangsTitle,
        options: Array.from(unsetLanguages.entries()).map(([value, label]) => ({
          label: (
            <div className="flex flex-1 flex-row">
              <Tooltip
                title={addLangTooltip.replace(/\{\{lang\}\}/, label)}
                placement="right"
              >
                <div className="mr-2">
                  <PlusCircleOutlined />
                </div>
              </Tooltip>
              {label}
            </div>
          ),
          searchable: label,
          value,
        })),
      },
    ];
  }, [value, selectedLang, deleteLang]);

  return (
    <div className="flex flex-1 flex-row relative">
      <Component
        ref={input}
        className="flex flex-1"
        value={isLocalizedTextObject(value) ? value[selectedLang] : value}
        onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
          setValue(value, selectedLang)
        }
        {...InputProps}
      />
      <Tooltip title={setLangTooltip} placement="left">
        <div
          className="absolute top-2 right-2"
          style={{
            top: `calc(0.5rem + ${iconMarginTop}${
              typeof iconMarginTop == 'number' ? 'px' : ''
            })`,
          }}
        >
          <CustomSelect
            options={langs}
            value={selectedLang}
            onChange={(lang) => {
              addLang(lang);
            }}
            renderValue={() => <GlobalOutlined />}
            showSearch
            placement="bottomRight"
          />
        </div>
      </Tooltip>
    </div>
  );
};

export default LocalizedInput;
