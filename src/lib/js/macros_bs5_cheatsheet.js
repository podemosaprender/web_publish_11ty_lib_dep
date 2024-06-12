//INFO: bootstrap example cheatsheet to macros
//U: baje el .zip con ejemplos, lo indente con vim, lo procese con este archivo, lo voy a editar a mano

const fs= require('fs');

const src_html= fs.readFileSync('index.html','utf8');
const lines= src_html.split(/[\r\n]+/);

let cur_categ= '';
let cur_indent= 0;
let cur_example= null;
lines.forEach( l => {
	let m= l.match(/<article.*?id="([^"]+)"/)
	if (m) { cur_categ= m[1].replace(/[^a-z_]/g,'_'); cur_example= null; console.log(`\n{# CATEGORY: ${cur_categ} #}\n`); return; }

	let mi= l.match(/^\s*/)[0].length;
	m= l.match(/bd-example/)
	if (m) { cur_indent= mi; cur_example= (cur_example||0) + 1; console.log(`{% macro ${cur_categ}_${cur_example}(cls='') %}`); return; }
	else if (cur_categ && cur_example!=null && cur_indent==mi) { console.log(`{% endmacro %}{# ${cur_categ}_${cur_example} #}\n`); return; }

	if (cur_example!=null && cur_indent<mi) { console.log(l.substr(cur_indent)); }
});
	
