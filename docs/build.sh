#!/usr/bin/env bash

MAIN_CONFIG=./mkdocs.yml
LAYOUT_TRANSLATION_DIR=./i18n
TMP_CONFIG=./.mkdocs_tmp.yml

internationalize_vocabulary() {
  if [ ! -f $2 ] ; then
    echo $2 translation is missing
    return 1
  fi
  while read p; do
    IFS=':' read -r from to <<< "$p"
    if [ -z "$from" ] || [ -z "$to" ] ; then
      continue
    fi
    translation_key="i18n.${from}"
    sed -i.bak "s/${translation_key}/${to}/g" $1
  done <$2
  rm $1.bak
}

build_config() {
  lang=$1
  filepath=$2
  if [ -z $lang ] || [ -z $filepath ] ; then
    echo 'Missing desired lang or output filepath'
    echo 'Usage : ./build.sh config fr fr_config.yml'
    return 1
  fi
  docs_dir=docs/$lang
  if [ ! -d $docs_dir ] ; then
    echo "Unknown lang $lang"
    return 1
  fi

  cp $MAIN_CONFIG "$filepath"
  echo "
docs_dir: $docs_dir
site_dir: public/$lang
cur_lang: $lang
" >> "$filepath"
  internationalize_vocabulary "$filepath" $LAYOUT_TRANSLATION_DIR/$lang.yml
}

build_lang() {
  lang=$1
  custom_config_file=$2
  config_file=${custom_config_file:-$TMP_CONFIG}
  build_config $1 $config_file
  if [ ! $? -eq 0 ] ; then
    echo "Could not generate config file. Stop here."
    return 1
  fi

  echo "Building $lang ..."
  mkdocs build -f $config_file
  if [ ! $? -eq 0 ] ; then
    exit 1
  fi

  if [ -z $custom_config_file ] ; then
    rm $config_file
  fi
}

build_all() {
  for lang_dir in ./docs/* ; do
    lang=${lang_dir[@]:7}
    build_lang $lang
  done
}

#build_changelog() {
#  npm run changelog
#}

usage() {
  echo "Usage :"
  echo "    ./build all"
  echo "    ./build fr"
  echo "    ./build en optional_output_config_name.yml"
}
if [ -z $1 ] ; then
  echo Missing command
  usage
elif [ $1 == 'all' ] ; then
#  build_changelog
  build_all
elif [ $1 == 'config' ] ; then
  shift
#  build_changelog
  build_config $@
else
#  build_changelog
  build_lang $1 $2
fi

cp -r theme/assets public/
