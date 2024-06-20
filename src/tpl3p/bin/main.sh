#!/usr/bin/bash
#INFO: bajar html y assets, convertir a template

P_URL=${1:-https://themesbrand.com/lezir/layout/layout-one-6.html}
DLD="${P_URL##*//}"
HTML="${DLD##*/}"
if [ -f "$DLD" ]; then echo "no download needed" ;
else 
	wget -pk "$P_URL" #A baja en dir con assets ; 
	find themesbrand.com/ -iname "*\?*" -exec bash -c 'i="{}"; mv "$i" "${i%%\?*}"' \;
fi

rm -Rf xo/ ; mkdir -p xo/page; 
node bin/8to_template_parsing.js "$DLD"  2>&1 #A: separa en templates
cp -r "${DLD%/*}"/* xo/page/ ; rm xo/page/$HTML
cp h.html xo/_includes/base.njk
