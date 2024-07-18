#!/usr/bin/bash

P_VAR_DIR=${P_VAR_DIR:-xvar}
P_PENDING_DIR=${P_PENDING_DIR:-$P_VAR_DIR/web_update}
P_SITE_JSON_DIR=${P_SITE_JSON_DIR:-src/sites_json}
P_REPOS_DIR=${P_REPOS_DIR:-xrepos}

BASE_DIR=`cd ${0%/*}/../../.. ; pwd`
echo "P_VAR_DIR=$P_VAR_DIR P_REPOS_DIR=$P_REPOS_DIR BASE_DIR=$BASE_DIR"
echo "PENDING at $P_PENDING_DIR `find $P_PENDING_DIR -type f`"

export P_VAR_DIR P_SITE_JSON_DIR P_REPOS_DIR
for site_id_path in $P_PENDING_DIR/in/${1:-*} ; do site_id=`basename $site_id_path`
	echo "GENERATE $site_id"
	#XXX:lock
	$BASE_DIR/src/lib/bin/generate1.sh $site_id UPDATED
done

