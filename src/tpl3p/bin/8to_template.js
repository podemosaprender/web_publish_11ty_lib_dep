//INFO: split an html file into our standard template
//U: bin/8to_template my_template/index.html

//XXX:LIB {
fs= require('node:fs');
yaml = require('js-yaml');
prettier= require("prettier");
const { parse }= require('node-html-parser');

function escapeRegex(string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function set_f(fpath, content) {
	let dir= fpath.replace(/[^\/]*$/,'');
	dir && fs.mkdirSync(dir,{recursive: true});
	fs.writeFileSync(fpath, content);
}

parse_opts= {
	lowerCaseTagName: true,
	comment: true,
	voidTag:{
		tags: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'],
		closingSlash: true //A: void tag serialisation, add a final slash <br/>
	},
	blockTextElements: { //A: keep text content when parsing
		script: true, noscript: true, style: true, pre: true
	}
}
function  norm_html(html) {
	let html_ast= parse(html,parse_opts)
	let html_norm= html_ast.outerHTML //.replace(/<[^>]+/gs,(m) => m.replace(/\s+/gs,' ').trim())
	//DBG: console.log(html_norm)
	return html_norm;
}

async function pretty_html(h) {
	let s= await prettier.format(h,{parser: 'html', useTabs: true, printWidth: 2000})
	return s.replace(/\{{ tw\./gs,'\n$&');
}
//XXX:LIB }

async function main() {
src_path= process.argv[2];
out_dir= process.argv[3] || 'xo';
src_fname= src_path.match(/[^\/]+$/)[0];

html= fs.readFileSync(src_path,'utf8');
html= html.replace(new RegExp('"'+escapeRegex(src_fname),'gs'),'"');
//DBG: console.log(html);
html_norm= norm_html(html);
//A: espacios normalizados dentro de los tags

strs= {};
vars= {}
txt_cnt= 1;
html_vars= html_norm.replace(/(<([^\s>\/]+)[^>]+>)([^<]+)/gs, (n,tag,tagname,s)=> {
	let s_clean= s.replace(/[\s]+/gs,' ').trim()
	if (s_clean.length>0) { 
		let s_varname= 'v_'+tagname+'_'+encodeURIComponent(s_clean).replace(/[^a-z0-9]+/gsi,'_')
		if (tag=='<title>') { s_varname= 'TITLE_' }
		else if (s_varname.length>15) { s_varname= 'v_txt_'+(txt_cnt++) }
		//DBG: console.log("V",s_varname,tagname,tag,s_clean)
		strs[s_clean]= (strs[s_clean] || 0)+1; 
		vars[s_varname]= s_clean;
		return `${ tag }{{ p.${s_varname} }}`;
	}
	return n;
})
//DBG: console.log(html_vars)
//DBG: console.log(strs)sections_html= {}
//A: html_vars tiene variables en vez de string literals, asi reemplazamos

links= {}
html_links= html_vars.replace(/(<([^>\s\/]+)[^>]*?((?:src)|(?:href))="([^"]*)"[^>]*?)((?:(\/\s*)>)|(?:>(.*?)<\/\2))/gsi, 
	(m,tag,tagname,attr,v,_1,_2,content) => {
		if (tagname=="script" || tagname=="link" || v.match(/^\s*javascript:/)) return m; //A: dejamos igual

		vn= (content && content.match(/\{\{ (v_\w+) \}\}/)||[])[1]
		if (vn) { vname= `${vn}_${attr}`; } //A: teniamos var
		else { vname=`v_${tagname}_${attr}_${v.replace(/[^a-z0-9]+/gsi,'_')}`; }
		links[vname]= {tagname,attr,v,tag,content};
		vars[vname]= v;
		return m.replace(new RegExp(escapeRegex(`${attr}="${v}"`),'g'),`${attr}="{{ p.${vname} }}"`);
	}
);
//DBG: console.log(links);

sections_html= {}
sections_html.BASE_= html_links.replace(/<!--\s*(.*?)\s+Start\s*-->(.*?)<!--\s*\1\s+End.*?-->/gsi, (m,name,content) => {
	name_clean= name.toLowerCase().trim().replace(/\W+/gs,'_');
	sections_html[name_clean]= content;
	return `{{ tw.${name_clean}(data) }}`
});

//DBG: console.log(html)
//DBG: console.log(sections_html)

function sort_kv(kv) {
	return Object.assign({},...Object.entries(kv).sort().map(([k,v])=>({[k]:v})));
}

set_f(`xo/page/index.yaml`,yaml.dump({data: sort_kv(vars)}));
set_f(`xo/page/links.yaml`,yaml.dump(sort_kv(links)));

Object.entries(sections_html).forEach( async ([k,v]) => set_f(`xo/_includes/${out_dir}/s_${k}.njk`, 
	await pretty_html(v)
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
	+await pretty_html(sections_html.BASE_))
}

main();
