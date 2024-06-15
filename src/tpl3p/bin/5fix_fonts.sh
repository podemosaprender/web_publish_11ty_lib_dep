#!/usr/bin/bash

P_PATH=1{1:-themesbrand.com/}
find $P_PATH -iname "*\?*" -exec bash -c 'i="{}"; mv "$i" "${i%%\?*}"' \;

