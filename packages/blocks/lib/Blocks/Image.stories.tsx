import { Story } from '@storybook/react';
import { Image } from './Image';

export default {
  title: 'Blocks/Image',
};

const Template: Story<any> = Image;

export const Default = Template.bind({});
Default.args = {
  caption: 'Some <strong>Image</strong>',
  src:
    'https://global-uploads.webflow.com/60a514cee679ef23b32cefc0/623b50b53d7d3f48ac9a376d_Banner.svg',
  alt: 'some image',
};
