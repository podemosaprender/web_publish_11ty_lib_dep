#!/usr/bin/bash

if [ "$1" == "force" ]; then FORCE=1 ; fi

P_SITE_JSON_DIR=${P_SITE_JSON_DIR:-src/sites_json}
P_VAR_DIR=${P_VAR_DIR:-xvar}
BASE_DIR=`cd ${0%/*}/../../.. ; pwd`
echo "P_SITE_JSON_DIR=$P_SITE_JSON_DIR P_VAR_DIR=$P_VAR_DIR BASE_DIR=$BASE_DIR"
mkdir -p $P_VAR_DIR/{files_json,files_3p,files_tpl,files_site,log}

for i in $P_SITE_JSON_DIR/*.json ; do
	iname=`basename ${i%%.json}`  
	files_lib_name="$P_VAR_DIR/webtpl"
	files_json_name="$P_VAR_DIR/files_json/$iname.json"
	files_tpl_name="$P_VAR_DIR/files_tpl/$iname"
	files_site_name="$P_VAR_DIR/files_site/$iname"
	files_log_name="$P_VAR_DIR/log/$iname.log"

	h256now=`cat $i | sha256sum`	
	h256before=`cat $P_VAR_DIR/files_json/${iname}.sha256 2>/dev/null`
	#DBG:echo "$h256now"; echo "$h256before"
	if [ -n "$FORCE" ]; then
		GEN_REASON="$i force"
	elif [ "$h256now" != "$h256before" ]; then
		GEN_REASON="$i changed"
	else
		echo "$i not changed"
	fi

	if [ -n "$GEN_REASON" ]; then	
		echo "$i generate $GEN_REASON"
		cat $i | node src/lib/js/gen_site.js > $files_json_name
		#A: json with file data generated

		rm -Rf $files_lib_name
		git clone ~/repos/webtpl -b main $files_lib_name ; 

		rm -Rf $files_tpl_name ;
		cp -r $files_lib_name/src $files_tpl_name; #A: el repo las tiene en src/
		for i in $BASE_DIR/src/this_site/{_data,_here*}; do
			ln -sf $i $files_tpl_name/
		done	
	 	cat $files_json_name | node src/lib/js/json2file.js $files_tpl_name
		#A: template files generated

		export P_SITE_DIR=$files_tpl_name
		export P_OUT_DIR=$files_site_name
		rm -rf $P_OUT_DIR ; 
		if DBG=6 npm run build 2>&1 | tee $files_log_name ; then
			echo "$h256now" > $P_VAR_DIR/files_json/${iname}.sha256 #A: sha256 updated
			echo "SITE UPDATED"
		fi
	fi
done
