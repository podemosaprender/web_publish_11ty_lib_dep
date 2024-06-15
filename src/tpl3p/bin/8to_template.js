//INFO: split an html file into our standard template
//U: bin/8to_template my_template/index.html

fs= require('node:fs');

src_path= process.argv[2];

html= fs.readFileSync(src_path,'utf8');
html_norm= html.replace(/<[^>]+/gs,(m) => m.replace(/\s+/gs,' ').trim())

strs= {};
html_vars= html_norm.replace(/(<[^>]+>)([^<]+)/gs, (n,tag,s)=> {
	let s_clean= s.replace(/[\s]+/gs,' ').trim()
	if (s_clean.length>0) { 
		let s_varname= 'v_'+encodeURIComponent(s_clean).replace(/[^a-z0-9]+/gsi,'_')
		console.log("V",s_varname,s_clean)
		strs[s_clean]= (strs[s_clean] || 0)+1; 
		return `${ tag }{{ ${s_varname} }}<`;
	}
	return n;
})
//DBG: console.log(html_vars)
//DBG: console.log(strs)sections_html= {}
//A: html_vars tiene variables en vez de string literals, asi reemplazamos

sections_html= {}
sections_html.BASE_= html_vars.replace(/<!-- (.*?)\s+Start\s*-->(.*?)<!--\s+\1\s+End.*?-->/gs, (m,name,content) => {
	name_clean= name.toLowerCase().trim().replace(/\W+/,'_');
	sections_html[name_clean]= content;
	return `{% include "s_${name_clean}.njk" %}`
});

//DBG: console.log(html)
console.log(sections_html)


