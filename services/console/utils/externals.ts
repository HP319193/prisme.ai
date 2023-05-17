import React from 'react';
import ReactDom from 'react-dom';
import * as prismeaiDS from '@prisme.ai/design-system';
import * as prismeaiBlocks from '@prisme.ai/blocks';
import * as prismeaiSDK from './api';
import * as antd from 'antd';

export const externals = {
  React: { ...React, default: React },
  ReactDom: { ...ReactDom, default: ReactDom },
  prismeaiDS,
  prismeaiSDK,
  prismeaiBlocks,
  antd
};

export default externals;
