#!/bin/bash

set -e

readonly path=$@

if [[ -z path ]]; then
  echo "You must supply a path for Glift-core!"
  exit 1
fi

if [[ ! -d $path ]]; then
  echo "Path supplied was not a directory!"
  exit 1
fi

if [[ ! -f ${path}package.json ]]; then
  echo "Could not find a package.json!"
  exit 1
fi


readonly name=$(grep "\"name\": \"glift-core\"" ${path}package.json)

if [[ -z $name ]]; then
  echo "Could not find the glift-core package.json!"
  exit 1
fi

readonly src_path="${path}src"

readonly lib_path=$(echo $0 | sed "s/\\/[^/]*$/\\//g")src/glift-core

echo "Copying Glift-core"

# Ensure that Glift is readonly.
rsync -r --chmod=a-w $src_path/* $lib_path
