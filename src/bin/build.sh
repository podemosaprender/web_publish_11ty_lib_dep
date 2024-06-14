#!/usr/bin/bash

if find -iname "*.ipynb" | grep .; then #A: necesitamos nbconvert !
	if jupyter 2>&1 | grep -q nbconvert; then
		echo "nbconvert installed"
	else
		pip install jupyter nbconvert 2>&1 | tail
	fi
fi

if [ -f _builder/plantuml.jar ]; then echo "plantuml.jar is here" ;
else 
	echo "Downloading plantuml.jar" ;
	wget -O _builder/plantuml.jar https://github.com/plantuml/plantuml/releases/download/v1.2024.5/plantuml-lgpl-1.2024.5.jar
	ls -l _builder/plantuml.jar
fi

(
	cd _builder
	if ! [ -d node_modules ]; then npm ci --legacy-peer-deps; fi
)

#cp -R _static/. site/public/
#A: archivos defaults y estaticos mas facil que hacerlo con node

(
	cd _builder
	npm run build
) #OJO: Actions en RepoDocumentos espera HTML en site/out
