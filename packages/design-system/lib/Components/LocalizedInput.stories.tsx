import { LocalizedInput, LocalizedInputProps } from './LocalizedInput';
import { Story } from '@storybook/react';
import { useState } from 'react';
import TextArea from './TextArea';

export default {
  title: 'Components/LocalizedInput',
  component: LocalizedInput,
};

const Template: Story<LocalizedInputProps> = (props) => {
  const [value, setValue] = useState(props.value);
  return (
    <div className="flex flex-1 flex-col">
      <LocalizedInput
        {...props}
        value={value}
        onChange={setValue}
        InputProps={{ label: 'Translated string' }}
        iconMarginTop={15}
      />
      <pre>
        <code>{JSON.stringify(value, null, '  ')}</code>
      </pre>
    </div>
  );
};

export const Default = Template.bind({});
Default.storyName = 'not already translated';
Default.args = {
  value: 'hello',
};

export const Localized = Template.bind({});
Localized.storyName = 'With some translations';
Localized.args = {
  value: { fr: 'Bonjour' },
};

export const Textarea = Template.bind({ Input: TextArea });
Textarea.storyName = 'With textarea';
Textarea.args = {
  value: { fr: 'Bonjour' },
  Input: TextArea,
};
