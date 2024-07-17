#INFO: desplegar test, prod, editar interactivo

Del ultimo paso hacia atras:
0. t3st a prod (OjO! URLS)
1. arreglar URLs con prefijos ej /mauriciocap.com cuando esta en t3st.o-o.fyi vs / cuando esta en mauriciocap.com
2. arreglar URLs con el nombre del sitio ej https?://t3st.o-o.fyi -> https?://o-o.fyi
3. PISAR en carpeta que se muestra en la web ej mauriciocap.com, (REPO_WEB)
   * XXX: OjO! no pisar otros archivos desplegados "a mano" en subcarpetas (REPO_NOGEN)
4. generar version nueva -> update1.sh
5. preparar archivos nuevos (REPO_SRC) -> update1.sh
6. preparar ambiente con lib (REPO_LIB) -> update1.sh

Tengo
* generador que sigue los pasos en 
   * 6 a 4: src/lib/bin/generate1.sh #A: genera UN sitio con su json y repo
   * src/lib/bin/o-o-mk-redirect.py
* actualizadores de archivos que disparan la actualizacion en ../../pa/pa_zk/src/bin/

el python lo estaba ejecutando con
~~~
#!/usr/bin/bash

echo "Content-type: text/plain"
echo ""
echo "Updating..."
date

export LANG=en_US.UTF-8
export PYTHONIOENCODING=UTF-8
python3.12 ~/bin/o-o-mk-redirect.py 2>&1
~~~
