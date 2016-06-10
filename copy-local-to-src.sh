#!/bin/bash

set -e

readonly path=$@

if [[ -z path ]]; then
  echo "You must supply a path for the local repo!!"
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


readonly name=$(grep "^  \"name\":.*" ${path}package.json | sed "s/.*\"\(.*\)\"[^:].*/\1/g")

if [[ -z $name ]]; then
  echo "Could not find the package.json!"
  exit 1
fi

readonly src_path="${path}src"

readonly lib_path=$(echo $0 | sed "s/\\/[^/]*$/\\//g")src/$name

echo "Copying $src_path to $lib_path"

# Ensure that the dirs are readonly.
rsync -r --chmod=a-w $src_path/* $lib_path
