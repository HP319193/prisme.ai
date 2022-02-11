#!/usr/bin/env bash

serve() {
  tmp_config=./.$1_mkdocs.yml
  if ! (./build.sh config $1 $tmp_config) ; then
    return 1
  fi
  mkdocs serve -f $tmp_config
  # rm $tmp_config
}

usage() {
  echo "Usage :"
  echo "    ./serve fr"
  echo "    ./serve en"
}
if [ -z $1 ] ; then
  echo Missing lang
  usage
else
  serve $1
fi


