#!/usr/bin/bash

#U: bin/1get https://themesbrand.com/lezir/layout/layout-one-6.html
P_URL=${1:-https://themesbrand.com/lezir/layout/layout-one-6.html}

wget -pk "$P_URL"


