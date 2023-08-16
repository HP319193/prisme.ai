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
  antd,
};

declare global {
  interface Window {
    __external: typeof externals;
  }
}

if (typeof window !== 'undefined') {
  window.__external = externals;
}

export default externals;
