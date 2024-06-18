//INFO: split an html file into our standard template
//U: bin/8to_template my_template/index.html

const htmlutil= require('./htmlutil.js');
const { escapeRegex, set_f, sort_kv }= htmlutil;
const { vars,links,strs }= htmlutil; //XXX:encapsular
//XXX:LIB {
//XXX:LIB }

async function main() {
	let html= htmlutil.html_read(); //A:norm, vars y links

	sections_html= {}
	sections_html.BASE_= html.html_links.replace(/<!--\s*(.*?)\s+Start\s*-->(.*?)<!--\s*\1\s+End.*?-->/gsi, (m,name,content) => {
		name_clean= name.toLowerCase().trim().replace(/\W+/gs,'_');
		sections_html[name_clean]= content;
		return `{{ tw.${name_clean}(data) }}`
	});

	//DBG: console.log(html)
	//DBG: console.log(sections_html)

	set_f(`xo/page/index.yaml`,yaml.dump({data: sort_kv(html.vars)}));
	set_f(`xo/page/links.yaml`,yaml.dump(sort_kv(html.links)));

	Object.entries(sections_html).forEach( async ([k,v]) => set_f(`xo/_includes/${out_dir}/s_${k}.njk`, 
		await htmlutil.pretty_html(v)
	))

	set_f(`xo/_includes/${out_dir}/macros.njk`, 
		Object.keys(sections_html).map( (k) => k=='BASE_' ? '' :
`
{% macro ${k}(p) %}	
	{% include "xo/s_${k}.njk" %}
{% endmacro %}
`
		).join('')
	)

	set_f(`xo/page/index.njk`, 
`---
	layout:
---
{% import "xo/macros.njk" as tw %}
`
		+await htmlutil.pretty_html(sections_html.BASE_))
}

main();
