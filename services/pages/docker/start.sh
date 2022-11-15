#!/bin/sh

node services/pages/docker/start.js
npm --prefix services/pages start
