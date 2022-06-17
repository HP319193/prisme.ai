export function ListItem({ children = null }) {
  return children;
}

export function SearchInput({ children = null }) {
  return children;
}

export function Input({ children = null }) {
  return children;
}

export function Space({ children = null }) {
  return children;
}

export function Title({ children = null }) {
  return children;
}

export function Button({ children = null }) {
  return children;
}

export function SidePanel({ children = null }) {
  return children;
}

export function Menu({ children = null }) {
  return children;
}

export function Dropdown({ children = null }) {
  return children;
}

export function Divider({ children = null }) {
  return children;
}

export function Avatar({ children = null }) {
  return children;
}

export function Collapse({ children = null }) {
  return children;
}

export function Feed({ children = null }) {
  return children;
}

export function Layout({ children = null }) {
  return children;
}

export function Section({ children = null }) {
  return children;
}

export function CollapseItem({ children = null }) {
  return children;
}

export function PageHeader({ children = null }) {
  return children;
}

export function Row({ children = null }) {
  return children;
}

export function Col({ children = null }) {
  return children;
}

export function MenuTab({ children = null }) {
  return children;
}

export function Table({ children = null }) {
  return children;
}

export function Text({ children = null }) {
  return children;
}

export function TagEditable({ children = null }) {
  return children;
}

export function EditableTitle({ children = null }) {
  return children;
}

export function Loading({ children = null }) {
  return children;
}

export function Modal({ children = null }) {
  return children;
}

export function Card({ children = null }) {
  return children;
}

export function Switch({ children = null }) {
  return children;
}

export function Tooltip({ children = null }) {
  return children;
}

export const notification = {
  error: jest.fn(),
  confirm: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
};

export function Select({ children = null }) {
  return children;
}

export function Popover({ children = null }) {
  return children;
}

export function LocalizedInput({ children = null }) {
  return children;
}

export function SchemaForm({ children = null }) {
  return children;
}

export function SchemaFormDescription({ children = null }) {
  return children;
}

export const schemaTypes = [
  'string',
  'localized:string',
  'number',
  'localized:number',
  'boolean',
  'localized:boolean',
  'object',
  'array',
];

export const UIWidgetsByType = {
  string: ['upload', 'select'],
};

const localize = (text) =>
  text && typeof text === 'object' ? text.en || '' : text;
const localizeSchemaForm = (schema) => schema;

export function useLocalizedText(t, language) {
  return {
    localize,
    localizeSchemaForm,
  };
}
