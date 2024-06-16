INFO: 11ty test

~~~
npm install
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
