#!/bin/bash

if [ -f ".env" ]; then
  echo ".env file exists. ✅"
else
  echo ".env file does not exist."
  cp .env.example .env
fi

for dir in apps/* packages/*; do
  if [ -d "$dir" ]; then
    target="$dir/.env"
    # Only link if target does not exist or is not already a symlink to the right location
    if [ ! -L "$target" ] || [ "$(readlink -- "$target")" != "$(realpath .env)" ]; then
      if [ ! -e "$target" ]; then
        link .env "$target"
      fi
    fi
  fi
done