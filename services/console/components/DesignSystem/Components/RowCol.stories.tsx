import { Row, Col } from '../index';
import { Story } from '@storybook/react';

export default {
  title: 'Components/RowCol',
  parameters: {
    layout: 'padded',
  },
};

const Template: Story = (args) => (
  <>
    <Row>
      <Col span={24}>col</Col>
    </Row>
    <Row>
      <Col span={12}>col-12</Col>
      <Col span={12}>col-12</Col>
    </Row>
    <Row>
      <Col span={8}>col-8</Col>
      <Col span={8}>col-8</Col>
      <Col span={8}>col-8</Col>
    </Row>
    <Row>
      <Col span={6}>col-6</Col>
      <Col span={6}>col-6</Col>
      <Col span={6}>col-6</Col>
      <Col span={6}>col-6</Col>
    </Row>
  </>
);

export const VariousRowsWidth = Template.bind({});
