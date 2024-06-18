//INFO: split an html file into our standard template
//U: bin/8to_template my_template/index.html

const htmlutil= require('./htmlutil.js');
const { escapeRegex, set_f, sort_kv }= htmlutil;
const { out_dir }= htmlutil;
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


	const RE_BLOCK=/((\n\s+)<((?:li)|(?:div))) .*?\2<\/\3>(\1 .*?\2<\/(\3)>)*[ \t]*/si; //A: de afuera a dentro
	const RE_LINE=/(\n\s+<((?:li))) .*?<\/\2>(\1 .*?<\/(\2)>)*/gsi;
	
	//DBG: console.log(x)
	const to_tpl= function(x,acc={},parent='r_') {
		let i,xp;
		for (i=0,xp=''; x!=xp && i<1000; i++) { xp= x;		
			x= xp.replace(RE_BLOCK,
				(m,...a) => {
					let d= {id: [parent,'b',i].join('')}; acc[d.id]= d;
					console.log('DBG:MATCH',d,{m});
					let [_1,indent,mcont]= m.match(/^(\s+)<[^>]+>(.*?)\s*<[^>]+>\s*$/s)
					console.log("DBG:CONT",d,{mcont})
					d.cont= to_tpl(mcont,acc,d.id);
					return `${indent}XXX_${d.id}\n`  //A: bloques interiores, match va de afuera hacia adentro
				}
			);
		}
		for (xp=''; x!=xp && i<1000; i++) { xp= x;		
			x= xp.replace(RE_LINE,
				(m,...a) => {
					let d= {id: [parent,'l',i].join('')}; acc[d.id]= d;
					console.log('DBG:MATCH_L',d,{m});
					d.cont= m;
					let [_1,indent]= m.match(/^(\s+)<[^>]+>/s)
					return `${indent}XXX_${d.id}\n`  //A: bloques interiores, match va de afuera hacia adentro
				}
			);
		}
		return x;
	}
	x= sections_html.pricing;
	xfin= to_tpl(x, acc=[]);
	console.log({xfin});
	console.log({acc});
}

main();
