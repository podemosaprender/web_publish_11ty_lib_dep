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

* en `src/_data/metadata.json` se configuran urls, titulos, redes sociales y otros links, etc.
* se usa en las plantillas ej como `{ metadata.url }`
* podes poner otros archivos en `src/_data` y usarlos del mismo modo en las plantillas


