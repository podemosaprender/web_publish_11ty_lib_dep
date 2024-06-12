#INFO: 11ty test

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

### Plantillas = Templates

SEE: https://mozilla.github.io/nunjucks/templating.html#filters

### Modo Dark

Pusimos este script, anda
SEE: https://getbootstrap.com/docs/5.3/customize/color-modes/#building-with-sass
