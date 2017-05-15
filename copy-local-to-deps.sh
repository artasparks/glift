#!/bin/bash

set -e

USAGE="=======================================================================
  copy-local-to-deps.sh <path>

  Copies a local node path to the deps and marks the directory read-only. This
  assumes that all the sources lie within the src/ tree, so is of limited use
  generally. However, it's useful for copying glift-core into the deps tree.

  Eventually, this will support pulling directly from Github.

  Example:
      copy-local-to-deps.sh ../glift-core"

# Ensure the REPO_PATH always has a trailing slash.
readonly REPO_PATH=${@%/}/

echo "Using repopath $REPO_PATH"

if [[ -z $REPO_PATH ]]; then
  echo "You must supply a path for the local repo!!"
  echo "$USAGE" >&2
  exit 1
fi

if [[ ! -d $REPO_PATH ]]; then
  echo "Path supplied was not a directory!"
  echo "$USAGE" >&2
  exit 1
fi

if [[ ! -f ${REPO_PATH}package.json ]]; then
  echo "Could not find a package.json!"
  echo "$USAGE" >&2
  exit 1
fi

readonly name=$(grep "^  \"name\":.*" ${REPO_PATH}package.json | sed "s/.*\"\(.*\)\"[^:].*/\1/g")

if [[ -z $name ]]; then
  echo "Could not find the package.json!"
  echo "$USAGE" >&2
  exit 1
fi

readonly SRC_PATH="${REPO_PATH}src"

readonly LIB_PATH=$(echo $0 | sed "s/\\/[^/]*$/\\//g")deps/$name

# echo "Copying $SRC_PATH to $LIB_PATH"

# Ensure that the dirs are readonly.
rsync -r $SRC_PATH/* $LIB_PATH

find $LIB_PATH -name "*.js" -print | xargs chmod a-w
