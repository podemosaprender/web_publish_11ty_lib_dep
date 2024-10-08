INFO: 11ty test

~~~
npm install
~~~

~~~
export P_SITE_DIR=`pwd`/x1 ; export P_OUT_DIR=xo ; rm -rf $P_OUT_DIR ; cp -r src/this_site/{_*,l1b_} $P_SITE_DIR ; npm run build
~~~

en el servidor usamos

~~~
rm -Rf xvar/ ; P_REPOS_DIR=.. src/lib/bin/generate1.sh web-site-tesla UPDATE 2>&1 | tee x.err ; find xvar/gen/files_site/web-site-*/gen_site_root/
~~~

## Desarrollo

~~~
npm run prepare #A: copiar y linkear de lib/template
npm run start 
~~~

Regenera automáticamente lo que editás (tal vez debas recargar en el navegador)

## Especialización

### Metadata y otros datos

* en `src/this_site/_data/1cfg_manual.json` se configuran urls, titulos, redes sociales y otros links, etc.
* se usa en las plantillas ej como `{ cfg.url }`
* podes poner otros archivos en `src/this_site/_data` y usarlos del mismo modo en las plantillas

SEE: https://www.11ty.dev/docs/collections/

* Eventos y calendar: ver ex/event*


### Plantillas = Templates

SEE: https://www.11ty.dev/docs/layout-chaining/
SEE: https://mozilla.github.io/nunjucks/templating.html#filters

* simular texto con `{% lorem %}`

### Iconos

Usamos CSS con https://icons.getbootstrap.com/#usage

### Links

Usar `{% link_to filepath %}`.

Así movemos archivos sigue funcionando todo.

SEE: https://www.npmjs.com/package/eleventy-plugin-link_to

SEE: https://www.11ty.dev/docs/permalinks/

Usamos https://github.com/ellisonleao/sharer.js ver ejemplo en widgets

### Diagramas

Usamos plantuml, ver ex/

### Modo Dark

Pusimos este script, anda
SEE: https://getbootstrap.com/docs/5.3/customize/color-modes/#building-with-sass

### 
TRY: https://github.com/nc7s/eleventy-multisite
TRY: https://github.com/zephraph/nunjucks-markdown pero con el procesador que estamos usando.
TRY: https://github.com/liamfiddler/eleventy-plugin-lazyimages?tab=readme-ov-file
TRY: https://www.npmjs.com/package/eleventy-plugin-rollup (watch, path y url auto)
TRY: https://github.com/KiwiKilian/eleventy-plugin-og-image (genera og con template)

NO ANDA: https://www.npmjs.com/package/eleventy-plugin-gen-favicons falla instalando sharp, instale con wasm32 pero no reconoce, intenta instalar y falla
NO USAR: https://github.com/gfscott/eleventy-plugin-embed-everything (no customizable, complejisimo sin sentido)

### Fabrica

~~~
cd src/tpl3
bin/main.sh "https://themesbrand.com/lezir/layout/layout-one-6.html"
~~~

* separa en una BASE (layout), e includes, con los includes define macros (funciona pasar vars)
* para combinar macros en "temas"
  * se arma un archivo que importa todos los archivos necesarios, cada uno as w1, w2, etc.
  * se reexporta el nombre con set, por ej `{% set navbar= w1.navbar %}{%set boton= w2.boton%}`
  * en la pagina se importa el del renglon de arriba
* se puede llamar la macro con una variable ej `tw[tipo](data)` y asi sacar las secciones del json!

### Workflow sitio

Copias carpeta modelo como g1ex con

* page.njk , frontmatter con secciones configurables
* css.njk, frontmatter con colores configurables
* agregas tus imagenes y otros archivos estaticos

### Workflow framework

Pruebo con ex/catalogo que es como me gustaria escribir ej SOLO poner page.njk con SOLO frontmater

Uso l1b_ para todo lo comun asi no malgasto un shortlink copado de o-o
Agregue un transform en .eleventy.js que expande regex #O-O#...
Lo use en `_includes/g1/base.njk` para probar si hay style.css en la misma carpeta o uso el general

Lo importante es que la lib se pueda copiar a "this_site" para desarrollar interactivo

XXX: me gustaria poder agrupar en carpetitas la "libreria" ej donde quiero tener search

Puedo automatizar operaciones como hago con search buscando en el html final (ojo, minificado)
* pagina que pasa data a collection con nombre
* 

Para las colecciones:
* en la pagina uso layout: con uno de includes para escribir minimo frontmatter
* uso {% extends (mytemplate or "dflt.njk") %} de nunjujs **en el layout** asi desde la pagina puedo cambiar lo que envuelve a mi contenido
* puedo poner un archivito json o 11tydata.js que se llame igual que la pagina para los datos
* puedo tener modelo ej para bajar de una planilla de google (solo le cambio la url), etc

XXX: tengo
* data y frontmatter data
* una entrada es layout y la cadena de layouts suma su frontmatter data (defaults)
* cuando se expande el layout ya estan disponibles las variables de la instancia, incluida content (solo HTML!) y se puede usar en njk como variable ej adentro de un bloque

ENTONCES:
* macros es lo que mas libertad me da
* y puedo elegir cuales incluyo tipo "toolkit" con una variable en el {%include del layout que puede cambiar la pagina-frontmatter, pagina.yaml, carpeta.yaml, 
   * los toolkits se pueden componer usando "set" en el archivo con las macros, porque exporta su env
* y si tengo que hacer algo muy distinto puedo incluir y reusar las macros del nivel que necesite en la pagina

Para ir armando widgets desde archivos como pide B podemos pegar los que esten en una carpetita y listo!


### Form

Funciona.

Los datos que guardo se recuperan con
~~~
curl -X 'GET'   'https://api1.o-o.fyi/xp.cgi/data/?fmt=json&entity=any'   -H 'accept: application/json' | tee x.json
~~~


XXX:agregar permisos en api1

### Donde escribir

blogspot: node src/lib/bin/import_blogspot.js | tee x.yaml
