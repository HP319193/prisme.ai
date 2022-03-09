import { Loading } from '../';
import { Story } from '@storybook/react';
import { LoadingProps } from './Loading';

export default {
  title: 'Components/Loading',
  component: Loading,
  argTypes: {
    type: {
      options: ['grey', 'regular'],
      control: { type: 'select' },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<LoadingProps> = ({}) => <Loading />;

export const Default = Template.bind({});
